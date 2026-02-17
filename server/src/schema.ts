import { GraphQLScalarType, Kind } from "graphql";
import type { GraphQLContext } from "./context.js";

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

  type Query {
    health: String!
    me: User
    track(id: ID!): Track
    tracks(search: String, page: Int = 1, pageSize: Int = 10): TrackConnection!
    favorites(page: Int = 1, pageSize: Int = 20): TrackConnection!
  }

  type Mutation {
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
    throw new Error("Unauthorized");
  }
  return ctx.user;
}

export const resolvers = {
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
    }
  },
  Mutation: {
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
    }
  }
};
