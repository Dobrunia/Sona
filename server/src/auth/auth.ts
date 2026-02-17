import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";
import { config } from "@core/config.js";
import type { PrismaClient, User } from "@prisma/client";
import { badInput, internalError, unauthenticated } from "@core/errors.js";

const googleClient = new OAuth2Client();

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
};

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyGoogleIdToken(idToken: string) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw badInput("Invalid Google token payload");
    }

    return {
      email: payload.email,
      name: payload.name ?? null,
      avatar: payload.picture ?? null
    };
  } catch {
    throw unauthenticated("Invalid Google token");
  }
}

export async function issueTokens(prisma: PrismaClient, user: User): Promise<AuthTokens> {
  if (!config.jwtSecret) {
    throw internalError("JWT secret is not configured");
  }
  const expiresInSeconds = config.accessTokenTtlMinutes * 60;
  const accessToken = jwt.sign(
    { sub: String(user.id), email: user.email },
    config.jwtSecret,
    { expiresIn: expiresInSeconds }
  );

  const refreshToken = randomBytes(48).toString("base64url");
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt
    }
  });

  return { accessToken, refreshToken, expiresInSeconds };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
