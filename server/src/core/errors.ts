import { GraphQLError } from "graphql";

export type ErrorCode =
  | "BAD_USER_INPUT"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL";

export class AppError extends Error {
  code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.code = code;
  }
}

export function gqlError(message: string, code: ErrorCode) {
  return new GraphQLError(message, {
    extensions: { code }
  });
}

export function badInput(message: string) {
  return new AppError(message, "BAD_USER_INPUT");
}

export function unauthenticated(message: string) {
  return new AppError(message, "UNAUTHENTICATED");
}

export function forbidden(message: string) {
  return new AppError(message, "FORBIDDEN");
}

export function notFound(message: string) {
  return new AppError(message, "NOT_FOUND");
}

export function rateLimited(message: string) {
  return new AppError(message, "RATE_LIMITED");
}

export function internalError(message: string) {
  return new AppError(message, "INTERNAL");
}

export function formatGraphQLError(error: GraphQLError) {
  const original = error.originalError;

  if (original instanceof AppError) {
    return gqlError(original.message, original.code);
  }

  if (error.extensions?.code) {
    return error;
  }

  return gqlError("Internal error", "INTERNAL");
}
