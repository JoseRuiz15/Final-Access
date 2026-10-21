import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { resolve } from 'node:path';
import { db, sql } from './pool.js';

/**
 * Aplica las migraciones de Drizzle usando solo `drizzle-orm` (que es una
 * dependencia de producción). Sirve para que Railway ejecute las migraciones
 * al arrancar, sin depender de `drizzle-kit` (devDependency).
 */
const migrationsFolder = resolve(process.cwd(), 'drizzle');

try {
  await migrate(db, { migrationsFolder });
  console.log('✅ Migraciones aplicadas correctamente');
} catch (err) {
  console.error('❌ Error al aplicar las migraciones:', err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
