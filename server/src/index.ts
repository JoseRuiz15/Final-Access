import { createApp } from './app.js';
import { env } from './config/env.js';

async function main() {
  const app = await createApp();

  // Fastify no instala manejadores de SIGINT/SIGTERM: sin esto, Railway
  // mataría el proceso al desplegar y los hooks onClose (cierre del pool de
  // Postgres) no se ejecutarían.
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      app.log.info(`${signal} recibido, cerrando el servidor...`);
      app
        .close()
        .then(() => process.exit(0))
        .catch((err) => {
          app.log.error(err);
          process.exit(1);
        });
    });
  }

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`🚀 Server listening at http://localhost:${env.PORT}`);
    app.log.info(`📚 Swagger docs at http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
