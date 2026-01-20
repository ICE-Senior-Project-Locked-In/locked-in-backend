import "dotenv/config";
import type { LevelWithSilent } from "pino";
import { z } from "zod";

const logLevel: Record<LevelWithSilent, true> = {
    fatal: true,
    error: true,
    warn: true,
    info: true,
    debug: true,
    trace: true,
    silent: true,
};

const boolString = z
    .preprocess(
        (value) => (typeof value === "string" ? value.toLowerCase().trim() : value),
        z.enum(["true", "false"])
    )
    .transform((value) => value === "true");

const packageVersion = process.env.npm_package_version ?? "0.0.0";

const envSchema = z.object({
    PORT: z.coerce.number().default(4000),
    ENV: z.enum(["development", "test", "production"]).default("development"),
    API_BASE_URL: z.url().optional(),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    // JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    // ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
    CORS_ALLOWED_ORIGINS: z.string().optional(),
    CORS_ALLOW_CREDENTIALS: boolString.optional(),
    LOG_LEVEL: z
        .string()
        .refine(
            (value): value is LevelWithSilent =>
                (value as LevelWithSilent) in logLevel,
            "Invalid LOG_LEVEL"
        )
        .default("info"),
    BUILD_VERSION: z.string().optional(),
    BUILD_COMMIT_SHA: z.string().optional(),
    BUILD_TIMESTAMP: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment configuration:",
    parsedEnv.error.flatten().fieldErrors
  );
  throw new Error("Environment validation failed.");
}

const env = parsedEnv.data;

const parseCorsOrigins = (value: string | undefined): string[] | null => {
  if (!value) {
    return null;
  }

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : null;
};

export const config = {
  port: env.PORT,
  env: env.ENV,
  apiBaseUrl: env.API_BASE_URL,
  databaseUrl: env.DATABASE_URL,
//   jwtSecret: env.JWT_SECRET,
//   accessTokenExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
  logLevel: env.LOG_LEVEL as LevelWithSilent,
  cors: {
    allowedOrigins: parseCorsOrigins(env.CORS_ALLOWED_ORIGINS),
    allowCredentials: env.CORS_ALLOW_CREDENTIALS ?? true,
  },
  build: {
    version: env.BUILD_VERSION ?? packageVersion,
    commitSha: env.BUILD_COMMIT_SHA ?? "unknown",
    timestamp: env.BUILD_TIMESTAMP ?? new Date().toISOString(),
  },
} as const;

export type AppConfig = typeof config;