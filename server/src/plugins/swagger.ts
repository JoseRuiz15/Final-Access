import { FastifyPluginAsync } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

const swaggerPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Final Acces API',
        description: 'API para el juego Final Acces - Autenticación, perfiles, progreso, lobbies',
        version: '1.0.0',
      },
      servers: [
        // Ruta relativa: funciona en local y en Railway sin hardcodear el host.
        { url: '/', description: 'Servidor actual' },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'token',
          },
        },
      },
      security: [{ cookieAuth: [] }],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });
};

export default swaggerPlugin;