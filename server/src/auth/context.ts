import type { Request } from "express";
import { prisma } from "../db/prisma.js";
import { config } from "../core/config.js";
import { verifyAccessToken } from "./auth.js";

export type ContextUser = {
  id: number;
  email: string;
} | null;

export type GraphQLContext = {
  prisma: typeof prisma;
  user: ContextUser;
};

export async function buildContext(req: Request): Promise<GraphQLContext> {
  const authHeader = req.header("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload?.sub) {
      const userId = Number(payload.sub);
      if (Number.isFinite(userId)) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true }
        });
        if (user) return { prisma, user };
      }
    }
  }

  if (config.allowUserIdHeader) {
    const rawUserId = req.header("x-user-id");
    if (rawUserId) {
      const userId = Number(rawUserId);
      if (Number.isFinite(userId)) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true }
        });
        return { prisma, user };
      }
    }
  }

  return { prisma, user: null };
}
