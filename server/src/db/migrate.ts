import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { resolve } from 'node:path';
import { db, sql } from './pool.js';

/**
 * Aplica las migraciones de Drizzle usando solo `drizzle-orm` (que es una
 * dependencia de producción). Sirve para que Railway ejecute las migraciones
 * al arrancar, sin depender de `drizzle-kit` (devDependency).
 */
const migrationsFolder = resolve(process.cwd(), 'drizzle');

// La base de datos puede tardar unos segundos en estar disponible justo
// después de un despliegue (o tras un reinicio del Postgres). Sin reintentos
// el `npm run start` terminaba con error y Railway reiniciaba el contenedor en
// bucle, dejando el servicio caído.
const MAX_INTENTOS = 5;
const DELAY_BASE_MS = 3000;

const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function aplicarMigraciones(): Promise<boolean> {
  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      await migrate(db, { migrationsFolder });
      console.log('✅ Migraciones aplicadas correctamente');
      return true;
    } catch (err) {
      console.error(
        `❌ Error al aplicar las migraciones (intento ${intento}/${MAX_INTENTOS}):`,
        err,
      );
      if (intento === MAX_INTENTOS) return false;
      // Espera creciente entre intentos: 3s, 6s, 9s, 12s.
      await esperar(DELAY_BASE_MS * intento);
    }
  }
  return false;
}

try {
  const ok = await aplicarMigraciones();
  // El código de salida 1 hace que `npm run start` (que encadena con `&&`)
  // no levante el servidor: es preferible fallar que servir una API con la
  // base de datos sin migraciones.
  if (!ok) process.exitCode = 1;
} catch (err) {
  console.error('❌ Error inesperado al aplicar las migraciones:', err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
