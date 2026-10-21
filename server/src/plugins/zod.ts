import { FastifyPluginAsync } from 'fastify';

const zodPlugin: FastifyPluginAsync = async (_app) => {
  // Zod validation se hace manualmente en cada ruta con schema.parse()
  // Este plugin queda como placeholder para futuras extensiones
};

export default zodPlugin;