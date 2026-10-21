import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';
import { env } from '../config/env.js';

// En plataformas serverless (Vercel, AWS Lambda, Cloudflare) el proceso se
// reinicia por petición, así que limitamos el pool a una sola conexión.
const esServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export const sql = postgres(env.DATABASE_URL, {
  // Neon/PgBouncer en modo "transaction" no soporta prepared statements.
  prepare: false,
  ssl: 'require',
  max: esServerless ? 1 : 10,
  idle_timeout: esServerless ? 0 : 20,
  connect_timeout: 10,
  onnotice: () => {},
});

if (!esServerless) {
  // Reutiliza la conexión entre recargas en caliente del dev server.
  const globalForDb = globalThis as unknown as { sql: postgres.Sql };
  globalForDb.sql = sql;
}

export const db = drizzle(sql, { schema });

export type DB = typeof db;
