import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/** The monorepo root holds the single .env shared by the server and drizzle-kit. */
const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, "../../../.env") });
config({ path: resolve(here, "../../.env"), override: false });

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}. Copy .env.example to .env and fill in your values.`);
  }
  return value;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL", process.env.DATABASE_URL),
  AUTH_SECRET: required("AUTH_SECRET", process.env.AUTH_SECRET),
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  /** Comma-separated list of browser origins allowed to send cookies to the API. */
  CLIENT_ORIGINS: (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;

export const isProduction = env.NODE_ENV === "production";
