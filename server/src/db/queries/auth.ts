import { db } from '../pool.js';
import { users, emailVerifications, passwordResetCodes } from '../schema.js';
import { eq, and, gt, lt, desc, sql } from 'drizzle-orm';
import { env } from '../../config/env.js';
import { timingSafeEqual } from 'node:crypto';
import type {
  InsertUser,
  InsertEmailVerification,
  InsertPasswordResetCode,
  User,
  EmailVerification,
  PasswordResetCode,
} from '../schema.js';

// ============================================
// AUTH QUERIES
// ============================================

export async function findUserByEmail(email: string): Promise<User | null> {
  // TEMPORARY: case-insensitive search for debugging
  const result = await db.select().from(users).where(sql`${users.email} ILIKE ${email}`).limit(1);
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

export async function createPasswordResetCode(data: InsertPasswordResetCode): Promise<PasswordResetCode> {
  const result = await db.insert(passwordResetCodes).values(data).returning();
  return result[0];
}

export async function findLatestPasswordResetCode(userId: number): Promise<PasswordResetCode | null> {
  const result = await db
    .select()
    .from(passwordResetCodes)
    .where(eq(passwordResetCodes.userId, userId))
    .orderBy(desc(passwordResetCodes.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function deletePasswordResetCodes(userId: number): Promise<void> {
  await db.delete(passwordResetCodes).where(eq(passwordResetCodes.userId, userId));
}

export async function incrementPasswordResetAttempts(id: number): Promise<void> {
  await db
    .update(passwordResetCodes)
    .set({ attempts: sql`${passwordResetCodes.attempts} + 1` })
    .where(eq(passwordResetCodes.id, id));
}

export async function consumePasswordResetCode(
  id: number,
  userId: number,
  codeHash: string,
  passwordHash: string,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const result = await tx
      .select()
      .from(passwordResetCodes)
      .where(and(eq(passwordResetCodes.id, id), eq(passwordResetCodes.userId, userId)))
      .limit(1)
      .for('update');
    const resetCode = result[0];
    if (!resetCode || resetCode.expiresAt <= new Date() || resetCode.attempts >= env.EMAIL_VERIFICATION_MAX_ATTEMPTS) {
      return false;
    }

    const storedHash = Buffer.from(resetCode.codeHash, 'hex');
    const candidateHash = Buffer.from(codeHash, 'hex');
    if (storedHash.length !== candidateHash.length || !timingSafeEqual(storedHash, candidateHash)) {
      await tx
        .update(passwordResetCodes)
        .set({ attempts: sql`${passwordResetCodes.attempts} + 1` })
        .where(eq(passwordResetCodes.id, id));
      return false;
    }

    const updatedUser = await tx
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ id: users.id });
    if (!updatedUser.length) return false;

    await tx.delete(passwordResetCodes).where(eq(passwordResetCodes.userId, userId));
    return true;
  });
}

export async function deleteExpiredVerifications(): Promise<number> {
  const now = new Date();
  const result = await db
    .delete(emailVerifications)
    .where(gt(emailVerifications.expiresAt, now));
  return result.length ?? 0;
}
