import { db } from './pool.js';
import { levels } from './schema.js';
import { pathToFileURL } from 'node:url';
import { sql as drizzleSql } from 'drizzle-orm';
import { sql } from './pool.js';

export async function seedLevels() {
  // Idempotente: si faltan niveles (por ejemplo, una base sembrada antes de
  // crear el nivel 3), los inserta sin duplicar los que ya existen.
  await db.insert(levels).values([
    {
      id: 1,
      name: 'Nivel 1 - Tutorial',
      description: 'Aprende los controles básicos del juego',
      unlockOrder: 1,
      isBossLevel: false,
      parTimeSec: 180,
    },
    {
      id: 2,
      name: 'Nivel 2 - Primer Desafío',
      description: 'Enfrenta a tus primeros enemigos',
      unlockOrder: 2,
      isBossLevel: false,
      parTimeSec: 240,
    },
    {
      id: 3,
      name: 'Nivel 3 - La Ciudad',
      description: 'Consigue la llave plateada, abre la compuerta y escapa de la ciudad',
      unlockOrder: 3,
      isBossLevel: false,
      parTimeSec: 180,
    },
  ]).onConflictDoUpdate({
    target: levels.id,
    // Mantiene sincronizados los metadatos de los niveles ya sembrados.
    set: {
      name: drizzleSql`excluded.name`,
      description: drizzleSql`excluded.description`,
      unlockOrder: drizzleSql`excluded.unlock_order`,
      isBossLevel: drizzleSql`excluded.is_boss_level`,
      parTimeSec: drizzleSql`excluded.par_time_sec`,
    },
  });

  console.log('✅ Levels seeded successfully');
}

// Permite ejecutar el archivo directamente (`npm run db:seed`) tanto en
// Windows como en Linux/macOS.
const esEjecucionDirecta = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;

if (esEjecucionDirecta) {
  await seedLevels();
  await sql.end({ timeout: 5 });
  process.exit(0);
}