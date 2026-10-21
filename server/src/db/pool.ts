import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';
import { env } from '../config/env.js';

// En plataformas serverless (Vercel, AWS Lambda, Cloudflare) el proceso se
// reinicia por petición, así que limitamos el pool a una sola conexión.
const esServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

/**
 * Modo TLS de la conexión.
 *
 * postgres.js da prioridad a las opciones explícitas sobre los parámetros de
 * la URL, así que el modo no puede dejarse en manos de la librería: se
 * resuelve aquí a partir del `sslmode` de la URL.
 *
 * - `sslmode=require` (Neon, Railway) → TLS sin verificar el certificado
 *   (Neon y Railway usan certificados propios, no de una CA pública).
 * - Sin `sslmode` contra un host local → conexión en claro: es lo que espera
 *   el Postgres de desarrollo (docker sin certificados SSL).
 * - Sin `sslmode` contra un host remoto → TLS obligatorio: Neon y Railway
 *   rechazan las conexiones en claro.
 */
function resolveSsl(url: string): false | 'allow' | 'prefer' | 'require' | 'verify-full' {
  const params = new URL(url).searchParams;
  const sslmode = params.get('sslmode')?.toLowerCase();

  if (sslmode === 'disable' || sslmode === 'false' || sslmode === '0') return false;
  if (sslmode === 'allow' || sslmode === 'prefer') return sslmode;
  // postgres.js no implementa 'verify-ca': se trata como 'verify-full', que
  // además exige que el nombre del host coincida con el certificado.
  if (sslmode === 'verify-ca' || sslmode === 'verify-full') return 'verify-full';
  if (params.get('sslrootcert') === 'system') return 'verify-full';

  const host = new URL(url).hostname.toLowerCase();
  const esLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';

  return esLocal ? false : 'require';
}

export const sql = postgres(env.DATABASE_URL, {
  // Neon/PgBouncer en modo "transaction" no soporta prepared statements.
  prepare: false,
  ssl: resolveSsl(env.DATABASE_URL),
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
