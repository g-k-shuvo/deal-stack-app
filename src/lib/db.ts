import { drizzle as nodePostgresDrizzle } from "drizzle-orm/node-postgres";
import { drizzle as neonHttpDrizzle } from "drizzle-orm/neon-http";
import { Pool } from "pg";
import { neon } from "@neondatabase/serverless";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is not set in the .env file");
  }
}

// Check if we should use local HTTP fallback to bypass port 5432 block/timeout on local firewalls
const isLocalDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

let activeDb: any;

if (isLocalDev && connectionString) {
  // Use Neon HTTP connection over HTTPS (port 443) - firewall friendly
  // Strip -pooler from the host for Neon HTTP compatibility
  const httpConnectionString = connectionString.replace("-pooler", "");
  const sql = neon(httpConnectionString);
  activeDb = neonHttpDrizzle({ client: sql, schema });
} else {
  // Use official Vercel/Neon pg Pool spec for production deployments
  const pool = new Pool({
    connectionString,
  });

  attachDatabasePool(pool);
  activeDb = nodePostgresDrizzle(pool, { schema });
}

export const db = activeDb;

// Database connection check function
export async function checkDbConnection(): Promise<string> {
  if (!connectionString) {
    return "No DATABASE_URL environment variable";
  }
  try {
    if (isLocalDev) {
      const httpConnectionString = connectionString.replace("-pooler", "");
      const sql = neon(httpConnectionString);
      await sql`SELECT 1`;
    } else {
      const pool = new Pool({ connectionString });
      await pool.query("SELECT 1");
      await pool.end();
    }
    return "Database connected";
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return "Database not connected";
  }
}
