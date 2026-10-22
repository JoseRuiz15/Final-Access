import { FastifyRequest, FastifyReply } from 'fastify';
import * as queries from '../db/queries/auth.js';
import { clearAuthCookie } from '../utils/cookies.js';

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

  let payload: { id: number; email: string; username: string };
  try {
    payload = await req.jwtVerify<{ id: number; email: string; username: string }>();
  } catch {
    clearAuthCookie(reply);
    return reply.code(401).send({ error: 'Unauthorized', message: 'Token inválido o expirado' });
  }

  // Un JWT puede estar bien firmado y, aun así, ser inservible: el token
  // dura 15 minutos, así que en cuanto caduca todas las rutas devuelven 401.
  // Peor aún, la cuenta puede haber desaparecido (otra base de datos, un
  // borrado...). En ambos casos la sesión no vale, así que se responde 401
  // (no 404) y se borra la cookie: el frontend detecta el 401, cierra la
  // sesión y manda al login en vez de dejar una pantalla a medias.
  const user = await queries.findUserById(payload.id);
  if (!user) {
    clearAuthCookie(reply);
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'La sesión ya no es válida: vuelve a iniciar sesión',
    });
  }

  req.authUser = { id: user.id, email: user.email, username: user.username };
}
