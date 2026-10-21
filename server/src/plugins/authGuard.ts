import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware de autenticación por cookie JWT.
 *
 * Las rutas declaran si son públicas con `config: { public: true }`. Todas las
 * demás exigen un JWT válido en la cookie `token`.
 *
 * Vive en un único sitio para no duplicar la lógica en cada plugin de rutas.
 */
export async function authGuard(req: FastifyRequest, reply: FastifyReply) {
  const config = req.routeOptions.config as { public?: boolean } | undefined;
  if (config?.public === true) return;

  // El handler de "ruta no encontrada" no tiene url: se deja que él responda
  // con su propio 404 en vez de devolver un 401 engañoso.
  if (!req.routeOptions.url) {
    return reply.code(404).send({
      error: 'Not Found',
      message: `Ruta ${req.method} ${req.url} no encontrada`,
      statusCode: 404,
    });
  }

  try {
    const payload = await req.jwtVerify<{ id: number; email: string; username: string }>();
    req.authUser = { id: payload.id, email: payload.email, username: payload.username };
  } catch {
    return reply.code(401).send({ error: 'Unauthorized', message: 'Token inválido o expirado' });
  }
}
