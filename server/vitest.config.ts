import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';

// Los tests se ejecutan contra el Postgres local (server/.env.test, que no se
// sube a git) para no dejar usuarios de prueba en la base de datos real
// (Neon). Si el fichero no existe, se usa el DATABASE_URL de server/.env.
// `override: true` para que .env.test gane siempre: si alguien tiene
// DATABASE_URL apuntando a Neon en la terminal, los tests NO deben escribir
// ahí.
const envTestPath = fileURLToPath(new URL('./.env.test', import.meta.url));
if (existsSync(envTestPath)) loadEnv({ path: envTestPath, override: true });

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    // Los tests necesitan el transporte de email en consola: es el único que
    // devuelve el `devCode` con el que completan el registro. Se fija aquí
    // (y no en `.env`) para que la suite no dependa de la configuración local
    // de cada uno. `dotenv` no pisa variables ya definidas, así que gana esto.
    env: {
      NODE_ENV: 'development',
      EMAIL_TRANSPORT: 'console',
      ...(process.env.DATABASE_URL ? { DATABASE_URL: process.env.DATABASE_URL } : {}),
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: ['./tests/setup.ts'],
    sequence: {
      shuffle: false,
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});