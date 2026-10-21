# Final Acces

Juego web (Vue 3 + Phaser) con backend propio (Fastify + TypeScript + Drizzle + PostgreSQL) para cuentas de usuario, perfiles, personajes, progreso, misiones y lobbies multijugador en tiempo real.

## Stack

| Capa          | Tecnología                                                                      |
| ------------- | ------------------------------------------------------------------------------- |
| Frontend      | Vue 3, Vite, Pinia, Vue Router, Tailwind 4, Flowbite, Phaser 4                  |
| Backend       | Node 22, Fastify 4, TypeScript, Drizzle ORM, PostgreSQL, JWT en cookie HttpOnly |
| Base de datos | Neon (PostgreSQL serverless)                                                    |
| Despliegue    | Vercel (frontend) · Railway (backend) · Neon (base de datos)                    |

## Estructura

```
src/        Frontend Vue (views, components, stores, game con Phaser)
server/     Backend Fastify (routes, services, db, drizzle/)
public/     Recursos estáticos (mapas de Tiled, tilesets, sprites)
```

## Desarrollo local

### 1. Base de datos

PostgreSQL local con la base `FINAL_ACCESS_BD` (la que espera `server/.env`):

```bash
docker run --name final-acces-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=FINAL_ACCESS_BD \
  -p 5432:5432 -d postgres:16
```

### 2. Backend

```bash
cd server
npm install
npm run db:migrate   # aplica los SQL de server/drizzle/
npm run db:seed      # personajes y misiones iniciales
npm run dev          # http://localhost:3000
```

La documentación de la API (Swagger) está en `http://localhost:3000/docs` fuera de producción.

### 3. Frontend

```bash
npm install
npm run dev          # http://localhost:5173
```

Las variables van en `.env.local` (plantilla en `.env.example`):

```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### Comandos

| Comando                      | Qué hace                                  |
| ---------------------------- | ----------------------------------------- |
| `npm run build`              | Compila el frontend a `dist/`             |
| `npm run lint`               | oxlint + eslint (reescriben los archivos) |
| `npm run format`             | Prettier sobre `src/`                     |
| `npm test`                   | Vitest                                    |
| `cd server && npm run build` | Compila el backend a `server/dist/`       |
| `cd server && npm test`      | Tests del backend (requieren la BD)       |

---

# Despliegue

## 1. Neon (base de datos)

1. Crea un proyecto en [neon.tech](https://neon.tech) y una rama (`main`).
2. En **Connection details** copia la URL **Pooled connection** (la que tiene
   `-pooler` en el host). Es la que usa el backend en runtime.
3. Copia también la **Direct connection** (sin `-pooler`): se usa solo para
   generar migraciones nuevas en local (`DATABASE_URL_UNPOOLED`).
4. La URL debe incluir `?sslmode=require` (el backend fuerza TLS en `server/src/db/pool.ts`).

## 2. Railway (backend)

1. **New Project → Deploy from GitHub** → elige el repositorio.
2. En el servicio, **Settings → Build & Deployment**:
   - **Root Directory**: `server` ← imprescindible, la raíz del repo es el frontend.
   - Build Command: `npm run build`
   - Start Command: `npm run start`
   - **Healthcheck Path**: `/health`
   - **Replicas**: `1` (el migrador de Drizzle no usa advisory lock; con varias
     réplicas las migraciones podrían pisarse).
3. En **Variables** pega el contenido de `server/railway.env.example` (cámbialo por
   tus valores). Lo mínimo imprescindible:

   ```
   DATABASE_URL=postgresql://...@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=<32+ caracteres>
   COOKIE_SECRET=<32+ caracteres>
   NODE_ENV=production
   FRONTEND_URL=https://tu-frontend.vercel.app
   COOKIE_DOMAIN=
   COOKIE_SECURE=true
   COOKIE_SAME_SITE=none
   EMAIL_FROM=tu-correo@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=tu-correo@gmail.com
   SMTP_PASS=<contraseña de aplicación de Google>
   ```

4. Despliega. Railway genera el dominio `https://<servicio>.up.railway.app`.
5. Comprueba que el servicio responde:

   ```bash
   curl https://<servicio>.up.railway.app/health
   # {"status":"ok","timestamp":"...","uptime":0.1}
   ```

Notas:

- `npm run start` ejecuta las migraciones antes de levantar el servidor; si la
  base de datos aún no está lista, reintenta hasta 5 veces antes de fallar.
- `PORT` lo inyecta Railway: no lo definas a mano.
- En producción no se expone Swagger (`/docs` queda deshabilitado).
- El frontend y el backend están en sitios distintos, por eso la cookie va con
  `SameSite=None` + `Secure` y `COOKIE_DOMAIN` vacío (`.railway.app` es un
  _public suffix_ y los navegadores rechazan las cookies que lo incluyen).

## 3. Vercel (frontend)

1. **Add New → Project** → importa el repositorio.
2. Preset: **Vite** (Build `npm run build`, Output `dist`). No hace falta cambiar nada.
3. En **Settings → Environment Variables** (Production + Preview):

   ```
   VITE_API_URL=https://<servicio>.up.railway.app
   VITE_WS_URL=wss://<servicio>.up.railway.app
   ```

   `VITE_WS_URL` es opcional: si no lo defines se deriva de `VITE_API_URL`
   (`http` → `ws`, `https` → `wss`).

4. Despliega. Si usas _Preview Deployments_, añade esos dominios a
   `FRONTEND_URL` del backend (separados por comas) o el CORS los rechazará.

## 4. Checklist final

- [ ] `curl https://<servicio>.up.railway.app/health` → `{"status":"ok"}`
- [ ] Registro real en la web: llega el email con el código de 6 dígitos
      (en producción el transporte SMTP está forzado; con `EMAIL_TRANSPORT=console`
      el código solo se imprime en el log).
- [ ] Login → la sesión persiste (cookie `token` en el navegador).
- [ ] Lobby en 2 pestañas: el WebSocket conecta y los "listos" se sincronizan.
- [ ] `FRONTEND_URL` incluye el dominio de Vercel (y los previews que uses).
- [ ] `JWT_SECRET` y `COOKIE_SECRET` son distintos y de 32+ caracteres.

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| El servidor no arranca y el log dice `Variables de entorno inválidas` | Falta `JWT_SECRET`, `COOKIE_SECRET` (32+ chars) o `EMAIL_FROM`/`SMTP_USER` | Revisa `server/railway.env.example` |
| `401 Unauthorized` en todas las peticiones | `FRONTEND_URL` no incluye el dominio de Vercel (CORS) o `COOKIE_SAME_SITE`/`COOKIE_SECURE` mal puestos | CORS devuelve error en la consola del navegador; la cookie necesita `SameSite=None` + `Secure` |
| La sesión se pierde al recargar | El navegador bloquea cookies de terceros (Vercel → Railway) | Comprueba la cookie `token` en DevTools → Application → Cookies |
| El email de verificación no llega | `SMTP_PASS` con espacios o con la contraseña normal de Google | En Gmail usa la **contraseña de aplicación** (16 caracteres) |
| `ECONNREFUSED` / `read ECONNRESET` al arrancar | `DATABASE_URL` mal pegada o Neon sin `sslmode=require` | Copia la URL *Pooled connection* de Neon tal cual, con `?sslmode=require` |
| El deploy se queda en "deploying" y luego falla | La BD todavía no responde | Las migraciones reintentan 5 veces; si persiste, revisa `DATABASE_URL` |

