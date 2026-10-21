import { config } from 'dotenv';
import { z } from 'zod';

config();

/**
 * `z.coerce.boolean()` convierte cualquier string no vacío en `true`, por lo que
 * `COOKIE_SECURE=false` terminaba activada. Este parser solo considera
 * verdadero "true", "1", "yes" u "on".
 */
const booleanFromEnv = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === 'boolean') return value;
    return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
  });

const envSchema = z
  .object({
    DATABASE_URL: z.string().url().startsWith('postgresql://'),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('15m'),
    COOKIE_SECRET: z.string().min(32),
    // Vacío = cookie host-only (obligatorio con .vercel.app / .up.railway.app,
    // que los navegadores rechazan por ser public suffixes).
    COOKIE_DOMAIN: z.string().default(''),
    COOKIE_SECURE: booleanFromEnv.default(false),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Acepta varios orígenes separados por coma (p. ej. producción + previews).
    FRONTEND_URL: z.string().default('http://localhost:5173'),
    EMAIL_TRANSPORT: z.enum(['console', 'smtp']).optional(),
    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().int().positive().default(465),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    EMAIL_FROM: z.string().default(''),
    EMAIL_VERIFICATION_TTL_MIN: z.coerce.number().int().positive().default(10),
    EMAIL_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(3),
    // Intentos máximos alTeclear el código de verificación (protección
    // contra fuerza bruta del código de 6 dígitos).
    EMAIL_VERIFICATION_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  })
  .superRefine((data, ctx) => {
    // SameSite=None exige Secure: el navegador descarta la cookie si no.
    if (data.COOKIE_SAME_SITE === 'none' && !data.COOKIE_SECURE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_SAME_SITE'],
        message: 'COOKIE_SAME_SITE=none requiere COOKIE_SECURE=true',
      });
    }

    // En producción hay que saber a quién se envía el email.
    if (data.NODE_ENV === 'production' && !data.EMAIL_FROM && !data.SMTP_USER) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['EMAIL_FROM'],
        message: 'EMAIL_FROM o SMTP_USER son obligatorios en producción',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Variables de entorno inválidas:');
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export const env = getEnv();

/** Orígenes del frontend permitidos por CORS. */
export const allowedOrigins = env.FRONTEND_URL.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
