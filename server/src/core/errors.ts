import type { GraphQLFormattedError, GraphQLError } from "graphql";

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

export function formatGraphQLError(
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError {
  const original = (error as GraphQLError | undefined)?.originalError;

  if (original instanceof AppError) {
    return {
      ...formattedError,
      message: original.message,
      extensions: {
        ...formattedError.extensions,
        code: original.code
      }
    };
  }

  if (formattedError.extensions?.code) {
    return formattedError;
  }

  return {
    ...formattedError,
    message: "Internal error",
    extensions: {
      ...formattedError.extensions,
      code: "INTERNAL"
    }
  };
}
