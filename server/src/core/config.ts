const env = process.env;

function numberFromEnv(key: string, fallback: number) {
  const raw = env[key];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export const config = {
  port: numberFromEnv("PORT", 4000),
  jwtSecret: env.JWT_SECRET ?? "",
  accessTokenTtlMinutes: numberFromEnv("ACCESS_TOKEN_TTL_MINUTES", 15),
  refreshTokenTtlDays: numberFromEnv("REFRESH_TOKEN_TTL_DAYS", 30),
  googleClientId: env.GOOGLE_CLIENT_ID ?? "",
  allowUserIdHeader: env.DEV_ALLOW_USER_ID_HEADER === "true",
  s3: {
    endpoint: env.S3_ENDPOINT ?? "",
    region: env.S3_REGION ?? "ru-central1",
    bucket: env.S3_BUCKET ?? "",
    accessKeyId: env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? "",
    publicUrl: env.S3_PUBLIC_URL ?? ""
  }
};

export function assertConfig() {
  const missing: string[] = [];

  if (!config.jwtSecret) missing.push("JWT_SECRET");
  if (!config.googleClientId) missing.push("GOOGLE_CLIENT_ID");

  if (!config.s3.endpoint) missing.push("S3_ENDPOINT");
  if (!config.s3.bucket) missing.push("S3_BUCKET");
  if (!config.s3.accessKeyId) missing.push("S3_ACCESS_KEY_ID");
  if (!config.s3.secretAccessKey) missing.push("S3_SECRET_ACCESS_KEY");

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}
