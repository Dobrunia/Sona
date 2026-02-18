import { GraphQLScalarType, Kind } from "graphql";
import { randomUUID } from "crypto";
import type { GraphQLContext } from "../auth/context.js";
import { config } from "../core/config.js";
import { assertAudio, assertCover, assertDuration, assertNumberMatch } from "../core/validation.js";
import { createUploadUrl, createStreamUrl, headObject } from "../storage/storage.js";
import { issueTokens, verifyGoogleIdToken, hashToken } from "../auth/auth.js";
import { assertUploadRate } from "../rate-limit/rateLimit.js";
import { probeDurationSeconds } from "../media/media.js";
import { forbidden, internalError, notFound, unauthenticated } from "../core/errors.js";
import type { Resolvers } from "./generated.js";

export const typeDefs = /* GraphQL */ `
  scalar DateTime

  type User {
    id: ID!
    email: String!
    name: String
    avatar: String
    createdAt: DateTime!
  }

  type Track {
    id: ID!
    title: String!
    artist: String
    fileKey: String!
    coverKey: String
    duration: Int!
    fileSize: Int!
    coverSize: Int
    playCount: Int!
    createdAt: DateTime!
    uploadedBy: User!
    likedByMe: Boolean!
    coverUrl: String
  }

  type Like {
    id: ID!
    userId: ID!
    trackId: ID!
    createdAt: DateTime!
  }

  type PageInfo {
    page: Int!
    pageSize: Int!
    total: Int!
    hasNextPage: Boolean!
  }

  type TrackConnection {
    items: [Track!]!
    pageInfo: PageInfo!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    expiresInSeconds: Int!
    user: User!
  }

  input TrackUploadRequestInput {
    title: String!
    artist: String
    fileName: String!
    fileSize: Int!
    fileMimeType: String!
    coverFileName: String
    coverSize: Int
    coverMimeType: String
  }

  type TrackUploadPayload {
    fileKey: String!
    uploadUrl: String!
    coverKey: String
    coverUploadUrl: String
    expiresInSeconds: Int!
  }

  input CreateTrackInput {
    title: String!
    artist: String
    fileKey: String!
    fileSize: Int!
    coverKey: String
    coverSize: Int
  }

  type Query {
    health: String!
    me: User
    track(id: ID!): Track
    tracks(search: String, page: Int = 1, pageSize: Int = 10): TrackConnection!
    favorites(page: Int = 1, pageSize: Int = 20): TrackConnection!
    streamUrl(trackId: ID!): String!
  }

  type Mutation {
    loginWithGoogle(idToken: String!): AuthPayload!
    refreshTokens(refreshToken: String!): AuthPayload!
    logout(refreshToken: String!): Boolean!

    requestTrackUpload(input: TrackUploadRequestInput!): TrackUploadPayload!
    createTrack(input: CreateTrackInput!): Track!

    toggleLike(trackId: ID!): Boolean!
    incrementPlayCount(trackId: ID!): Track!
  }
`;

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return new Date(value).toISOString();
    return null;
  },
  parseValue(value) {
    if (typeof value === "string") return new Date(value);
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  }
});

function requireUser(ctx: GraphQLContext) {
  if (!ctx.user) {
    throw unauthenticated("Unauthorized");
  }
  return ctx.user;
}

function ensureOwnedKey(userId: number, key: string) {
  const prefix = `users/${userId}/`;
  if (!key.startsWith(prefix)) {
    throw forbidden("Invalid file key");
  }
}

async function safeHead(key: string) {
  try {
    return await headObject(key);
  } catch {
    throw internalError("Failed to read uploaded file");
  }
}

export const resolvers: Resolvers = {
  DateTime: DateTimeScalar,
  Query: {
    health: () => "ok",
    me: (_: unknown, __: unknown, ctx: GraphQLContext) => ctx.user,
    track: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      return ctx.prisma.track.findUnique({
        where: { id: Number(args.id) },
        include: { uploadedBy: true }
      });
    },
    tracks: async (
      _: unknown,
      args: { search?: string; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      const page = Math.max(args.page ?? 1, 1);
      const pageSize = Math.min(Math.max(args.pageSize ?? 10, 1), 50);
      const where = args.search
        ? {
            OR: [
              { title: { contains: args.search } },
              { artist: { contains: args.search } }
            ]
          }
        : {};

      const [items, total] = await Promise.all([
        ctx.prisma.track.findMany({
          where,
          include: { uploadedBy: true },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        ctx.prisma.track.count({ where })
      ]);

      return {
        items,
        pageInfo: {
          page,
          pageSize,
          total,
          hasNextPage: page * pageSize < total
        }
      };
    },
    favorites: async (
      _: unknown,
      args: { page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      const user = requireUser(ctx);
      const page = Math.max(args.page ?? 1, 1);
      const pageSize = Math.min(Math.max(args.pageSize ?? 20, 1), 50);

      const [likes, total] = await Promise.all([
        ctx.prisma.like.findMany({
          where: { userId: user.id },
          include: { track: { include: { uploadedBy: true } } },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        ctx.prisma.like.count({ where: { userId: user.id } })
      ]);

      return {
        items: likes.map((like) => like.track),
        pageInfo: {
          page,
          pageSize,
          total,
          hasNextPage: page * pageSize < total
        }
      };
    },
    streamUrl: async (_: unknown, args: { trackId: string }, ctx: GraphQLContext) => {
      const track = await ctx.prisma.track.findUnique({
        where: { id: Number(args.trackId) }
      });
      if (!track) throw notFound("Track not found");
      const result = await createStreamUrl(track.fileKey);
      return result.url;
    }
  },
  Mutation: {
    loginWithGoogle: async (
      _: unknown,
      args: { idToken: string },
      ctx: GraphQLContext
    ) => {
      if (!config.googleClientId) {
        throw internalError("Google auth not configured");
      }

      const googleUser = await verifyGoogleIdToken(args.idToken);
      const user = await ctx.prisma.user.upsert({
        where: { email: googleUser.email },
        update: {
          name: googleUser.name,
          avatar: googleUser.avatar
        },
        create: {
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar
        }
      });

      const tokens = await issueTokens(ctx.prisma, user);
      return { ...tokens, user };
    },
    refreshTokens: async (
      _: unknown,
      args: { refreshToken: string },
      ctx: GraphQLContext
    ) => {
      const tokenHash = hashToken(args.refreshToken);
      const record = await ctx.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true }
      });

      if (!record || record.revokedAt || record.expiresAt < new Date()) {
        throw unauthenticated("Invalid refresh token");
      }

      await ctx.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() }
      });

      const tokens = await issueTokens(ctx.prisma, record.user);
      return { ...tokens, user: record.user };
    },
    logout: async (
      _: unknown,
      args: { refreshToken: string },
      ctx: GraphQLContext
    ) => {
      const tokenHash = hashToken(args.refreshToken);
      const record = await ctx.prisma.refreshToken.findUnique({
        where: { tokenHash }
      });

      if (record && !record.revokedAt) {
        await ctx.prisma.refreshToken.update({
          where: { id: record.id },
          data: { revokedAt: new Date() }
        });
      }

      return true;
    },
    requestTrackUpload: async (
      _: unknown,
      args: {
        input: {
          title: string;
          artist?: string | null;
          fileName: string;
          fileSize: number;
          fileMimeType: string;
          coverFileName?: string | null;
          coverSize?: number | null;
          coverMimeType?: string | null;
        };
      },
      ctx: GraphQLContext
    ) => {
      const user = requireUser(ctx);
      assertUploadRate(user.id);

      assertAudio({ mimeType: args.input.fileMimeType, sizeBytes: args.input.fileSize });

      if (args.input.coverFileName && args.input.coverMimeType && args.input.coverSize) {
        assertCover({
          mimeType: args.input.coverMimeType,
          sizeBytes: args.input.coverSize
        });
      }

      const baseKey = `users/${user.id}/${randomUUID()}`;
      const fileExtension = args.input.fileName.split(".").pop() || "mp3";
      const fileKey = `${baseKey}.${fileExtension}`;

      const upload = await createUploadUrl(fileKey, args.input.fileMimeType);

      let coverKey: string | null = null;
      let coverUploadUrl: string | null = null;
      if (args.input.coverFileName && args.input.coverMimeType) {
        const coverExtension = args.input.coverFileName.split(".").pop() || "jpg";
        coverKey = `${baseKey}-cover.${coverExtension}`;
        const coverUpload = await createUploadUrl(coverKey, args.input.coverMimeType);
        coverUploadUrl = coverUpload.url;
      }

      return {
        fileKey: upload.key,
        uploadUrl: upload.url,
        coverKey,
        coverUploadUrl,
        expiresInSeconds: upload.expiresIn
      };
    },
    createTrack: async (
      _: unknown,
      args: {
        input: {
          title: string;
          artist?: string | null;
          fileKey: string;
          fileSize: number;
          coverKey?: string | null;
          coverSize?: number | null;
        };
      },
      ctx: GraphQLContext
    ) => {
      const user = requireUser(ctx);
      ensureOwnedKey(user.id, args.input.fileKey);
      if (args.input.coverKey) ensureOwnedKey(user.id, args.input.coverKey);

      const [fileHead, coverHead] = await Promise.all([
        safeHead(args.input.fileKey),
        args.input.coverKey ? safeHead(args.input.coverKey) : Promise.resolve(null)
      ]);

      if (!fileHead.contentType || !fileHead.contentLength) {
        throw internalError("Uploaded file not found");
      }

      assertAudio({
        mimeType: fileHead.contentType,
        sizeBytes: fileHead.contentLength
      });

      if (args.input.fileSize) {
        assertNumberMatch("fileSize", args.input.fileSize, fileHead.contentLength);
      }

      let coverSize: number | null = null;
      if (args.input.coverKey) {
        if (!coverHead?.contentType || !coverHead?.contentLength) {
          throw internalError("Cover file not found");
        }

        assertCover({
          mimeType: coverHead.contentType,
          sizeBytes: coverHead.contentLength
        });

        if (args.input.coverSize) {
          assertNumberMatch("coverSize", args.input.coverSize, coverHead.contentLength);
        }

        coverSize = coverHead.contentLength;
      }

      const duration = await probeDurationSeconds(args.input.fileKey);
      assertDuration(duration);

      const track = await ctx.prisma.track.create({
        data: {
          title: args.input.title,
          artist: args.input.artist ?? null,
          fileKey: args.input.fileKey,
          fileSize: fileHead.contentLength,
          coverKey: args.input.coverKey ?? null,
          coverSize,
          duration,
          uploadedById: user.id
        },
        include: { uploadedBy: true }
      });

      return track;
    },
    toggleLike: async (
      _: unknown,
      args: { trackId: string },
      ctx: GraphQLContext
    ) => {
      const user = requireUser(ctx);
      const trackId = Number(args.trackId);

      const existing = await ctx.prisma.like.findUnique({
        where: { userId_trackId: { userId: user.id, trackId } }
      });

      if (existing) {
        await ctx.prisma.like.delete({ where: { id: existing.id } });
        return false;
      }

      await ctx.prisma.like.create({
        data: {
          userId: user.id,
          trackId
        }
      });

      return true;
    },
    incrementPlayCount: async (
      _: unknown,
      args: { trackId: string },
      ctx: GraphQLContext
    ) => {
      const trackId = Number(args.trackId);
      return ctx.prisma.track.update({
        where: { id: trackId },
        data: { playCount: { increment: 1 } },
        include: { uploadedBy: true }
      });
    }
  },
  Track: {
    likedByMe: async (
      parent: { id: number },
      _: unknown,
      ctx: GraphQLContext
    ) => {
      if (!ctx.user) return false;
      const like = await ctx.prisma.like.findUnique({
        where: { userId_trackId: { userId: ctx.user.id, trackId: parent.id } }
      });
      return Boolean(like);
    },
    coverUrl: async (parent: { coverKey: string | null }) => {
      if (!parent.coverKey) return null;
      const result = await createStreamUrl(parent.coverKey);
      return result.url;
    }
  }
};
