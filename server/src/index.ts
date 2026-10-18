import { createApp } from './app.js';
import { env } from './config/env.js';

async function main() {
  const app = await createApp();

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