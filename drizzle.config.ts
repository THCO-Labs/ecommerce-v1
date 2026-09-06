import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

/** Shared Drizzle configuration. The schema barrel re-exports every module model. */
export default defineConfig({
  dialect: "postgresql",
  schema: "./server/src/common/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
  verbose: true,
});
