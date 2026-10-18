import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/pool.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof db;
  }
}

const dbPlugin: FastifyPluginAsync = async (app) => {
  app.decorate('db', db);
  app.addHook('onClose', async () => {
    await sql.end({ timeout: 5 });
  });
};

import { sql } from '../db/pool.js';
export default dbPlugin;