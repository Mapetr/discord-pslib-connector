import {sql} from "@vercel/postgres";

export async function register() {
  // Uncomment to add the table to database
  // await sql`CREATE TABLE IF NOT EXISTS users (microsoft varchar(255), discord varchar(255), className varchar(16), name varchar(128))`;
  // await sql`ALTER TABLE users ADD CONSTRAINT uniqueIds UNIQUE (microsoft, discord)`;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
