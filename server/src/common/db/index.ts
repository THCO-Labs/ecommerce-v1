import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../env.js";
import * as schema from "./schema.js";

/**
 * One driver for every environment.
 *
 * Neon also speaks the ordinary PostgreSQL wire protocol, so node-postgres
 * serves both a managed Neon database and the plain PostgreSQL a preview
 * sandbox runs locally. The HTTP driver would only reach Neon, which makes it
 * unusable wherever the sandbox cannot open TLS to neon.tech.
 */
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Managed PostgreSQL requires TLS; a loopback cluster in a sandbox has none.
  ssl: /\.neon\.tech(?::|\/|$)/.test(new URL(env.DATABASE_URL).host)
    ? { rejectUnauthorized: false }
    : false,
});

/** Shared Drizzle client. Import this from services, never from controllers. */
export const db = drizzle(pool, { schema });
export { schema };
