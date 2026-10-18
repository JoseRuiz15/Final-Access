import { db } from '../pool.js';
import { users, emailVerifications } from '../schema.js';
import { eq, and, gt, sql } from 'drizzle-orm';
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
    .orderBy(emailVerifications.createdAt)
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