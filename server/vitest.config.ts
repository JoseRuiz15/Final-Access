import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

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