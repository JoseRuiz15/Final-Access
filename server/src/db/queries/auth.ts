import { db } from '../pool.js';
import { users, emailVerifications } from '../schema.js';
import { eq, and, gt, lt, desc, sql } from 'drizzle-orm';
import { env } from '../../config/env.js';
import type { InsertUser, InsertEmailVerification, User, EmailVerification } from '../schema.js';

// ============================================
// AUTH QUERIES
// ============================================

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0] ?? null;
}

export async function createUser(data: InsertUser): Promise<User> {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function createEmailVerification(data: InsertEmailVerification): Promise<EmailVerification> {
  const result = await db.insert(emailVerifications).values(data).returning();
  return result[0];
}

export async function findValidVerification(email: string, code: string): Promise<EmailVerification | null> {
  const now = new Date();
  const result = await db
    .select()
    .from(emailVerifications)
    .where(
      and(
        eq(emailVerifications.email, email),
        eq(emailVerifications.code, code),
        gt(emailVerifications.expiresAt, now),
        // El código de 6 dígitos solo es seguro si los intentos fallidos se
        // cuentan: sin este límite se puede forzar la verificación de una
        // cuenta ajena dentro de la ventana de expiración.
        lt(emailVerifications.attempts, env.EMAIL_VERIFICATION_MAX_ATTEMPTS),
      )
    )
    .limit(1);
  return result[0] ?? null;
}

export async function findVerificationByEmail(email: string): Promise<EmailVerification | null> {
  const result = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.email, email))
    // Del más reciente al más antiguo: si hay varias filas por email (registros
    // simultáneos), la válida siempre es la última creada.
    .orderBy(desc(emailVerifications.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function incrementVerificationAttempts(id: number): Promise<void> {
  await db
    .update(emailVerifications)
    .set({ attempts: sql`${emailVerifications.attempts} + 1` })
    .where(eq(emailVerifications.id, id));
}

export async function deleteVerification(email: string): Promise<void> {
  await db.delete(emailVerifications).where(eq(emailVerifications.email, email));
}

export async function deleteExpiredVerifications(): Promise<number> {
  const now = new Date();
  const result = await db
    .delete(emailVerifications)
    .where(gt(emailVerifications.expiresAt, now));
  return result.length ?? 0;
}