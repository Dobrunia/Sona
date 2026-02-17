import type { Request } from "express";
import { prisma } from "./prisma.js";

export type ContextUser = {
  id: number;
  email: string;
} | null;

export type GraphQLContext = {
  prisma: typeof prisma;
  user: ContextUser;
};

export async function buildContext(req: Request): Promise<GraphQLContext> {
  const rawUserId = req.header("x-user-id");
  if (!rawUserId) {
    return { prisma, user: null };
  }

  const userId = Number(rawUserId);
  if (!Number.isFinite(userId)) {
    return { prisma, user: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true }
  });

  return { prisma, user };
}
