import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import * as queries from '../db/queries/auth.js';
import * as profileQueries from '../db/queries/profile.js';
import * as progressionQueries from '../db/queries/progression.js';
import * as missionQueries from '../db/queries/missions.js';
import { sendPasswordResetEmail, sendVerificationEmail } from './emailService.js';
import type { User } from '../db/schema.js';

// ============================================
// AUTH SERVICE
// ============================================

const BCRYPT_ROUNDS = 12;

export function generateVerificationCode(): string {
  return randomInt(100000, 1000000).toString();
}

export function calculateExpiry(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createJwtPayload(user: User): { id: number; email: string; username: string } {
  return { id: user.id, email: user.email, username: user.username };
}

export async function startRegister(
  username: string,
  email: string,
  _password: string
): Promise<{ ok: true; message: string; devCode?: string }> {
  // Verificar si ya existe usuario con ese email
  const existingUser = await queries.findUserByEmail(email);
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  // Verificar si ya existe usuario con ese username
  const existingUsername = await queries.findUserByUsername(username);
  if (existingUsername) {
    throw new Error('El nombre de usuario ya está en uso');
  }

  // Verificar si hay una verificación pendiente para este email
  const existingVerification = await queries.findVerificationByEmail(email);
  if (existingVerification) {
    const now = new Date();
    if (existingVerification.expiresAt > now && existingVerification.attempts < 3) {
      // Reenviar código existente
      const emailResult = await sendVerificationEmail(email, existingVerification.code);
      // `emailResult` solo viene definido cuando el email no se envió de verdad
      // (transporte de consola en local y en tests).
      const devCode = emailResult ? emailResult.code : undefined;
      return { ok: true, message: 'Código reenviado a tu email', devCode };
    } else {
      // Expirada o muchos intentos: borrar y crear nueva
      await queries.deleteVerification(email);
    }
  }

  // Generar código y guardar verificación
  const code = generateVerificationCode();
  const expiresAt = calculateExpiry(env.EMAIL_VERIFICATION_TTL_MIN);

  await queries.createEmailVerification({
    email,
    code,
    expiresAt,
    attempts: 0,
  });

  // Enviar email
  const emailResult = await sendVerificationEmail(email, code);
  // `emailResult` solo viene definido cuando el email no se envió de verdad
  // (transporte de consola en local y en tests).
  const devCode = emailResult ? emailResult.code : undefined;

  return { ok: true, message: 'Código de verificación enviado a tu email', devCode };
}

export async function completeRegistration(
  username: string,
  email: string,
  password: string,
  code: string
): Promise<User> {
  // Verificar código
  const verification = await queries.findValidVerification(email, code);
  if (!verification) {
    const existing = await queries.findVerificationByEmail(email);
    if (existing) {
      await queries.incrementVerificationAttempts(existing.id);
    }
    throw new Error('Código inválido o expirado');
  }

  // Verificar que no exista ya el usuario (race condition)
  const existingUser = await queries.findUserByEmail(email);
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Crear usuario
  const user = await queries.createUser({
    username,
    email,
    passwordHash,
    emailVerified: true,
    provider: 'local',
  });

  // Crear perfil para el usuario
  await profileQueries.createProfile(user.id, username);

  // Crear progreso de juego para el usuario
  await progressionQueries.createGameProgress(user.id);

  // Asignar las misiones diarias del día al nuevo usuario
  await missionQueries.initializeUserMissions(user.id);

  // Borrar verificación usada
  await queries.deleteVerification(email);

  return user;
}

export async function resendVerification(email: string): Promise<{ ok: true; message: string }> {
  const existingVerification = await queries.findVerificationByEmail(email);
  const now = new Date();

  if (existingVerification) {
    if (existingVerification.expiresAt > now) {
      // Verificar rate limit
      if (existingVerification.attempts >= env.EMAIL_RATE_LIMIT_MAX) {
        throw new Error('Demasiados envíos. Espera antes de solicitar otro código.');
      }
      // Reenviar código existente
      await sendVerificationEmail(email, existingVerification.code);
      return { ok: true, message: 'Código reenviado a tu email' };
    } else {
      // Expirada: borrar y crear nueva
      await queries.deleteVerification(email);
    }
  }

  // Verificar que el email no esté ya registrado
  const user = await queries.findUserByEmail(email);
  if (user) {
    throw new Error('El email ya está registrado');
  }

  // Generar nuevo código
  const code = generateVerificationCode();
  const expiresAt = calculateExpiry(env.EMAIL_VERIFICATION_TTL_MIN);

  await queries.createEmailVerification({
    email,
    code,
    expiresAt,
    attempts: 0,
  });

  await sendVerificationEmail(email, code);

  return { ok: true, message: 'Nuevo código enviado a tu email' };
}

export async function login(email: string, password: string): Promise<User> {
  console.log('>>> AUTH SERVICE LOGIN CALLED <<<', { email });
  const user = await queries.findUserByEmail(email);
  console.log('>>> USER FOUND <<<', user ? { id: user.id, email: user.email, provider: user.provider, hasHash: !!user.passwordHash } : 'NOT FOUND');
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  console.log('>>> PASSWORD VALID <<<', valid);
  if (!valid) {
    throw new Error('Credenciales inválidas');
  }

  return user;
}

const PASSWORD_RESET_MESSAGE = 'Si el correo está asociado a una cuenta, recibirás un código de recuperación.';

function hashPasswordResetCode(userId: number, code: string): string {
  return createHmac('sha256', env.JWT_SECRET).update(`${userId}:${code}`).digest('hex');
}

export async function requestPasswordReset(
  email: string,
): Promise<{ ok: true; message: string; devCode?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await queries.findUserByEmail(normalizedEmail);
  if (!user || (user.provider && user.provider !== 'local')) {
    return { ok: true, message: PASSWORD_RESET_MESSAGE };
  }

  const code = generateVerificationCode();
  await queries.deletePasswordResetCodes(user.id);
  await queries.createPasswordResetCode({
    userId: user.id,
    codeHash: hashPasswordResetCode(user.id, code),
    expiresAt: calculateExpiry(env.EMAIL_VERIFICATION_TTL_MIN),
    attempts: 0,
  });

  try {
    const emailResult = await sendPasswordResetEmail(normalizedEmail, code);
    return {
      ok: true,
      message: PASSWORD_RESET_MESSAGE,
      ...(emailResult ? { devCode: emailResult.code } : {}),
    };
  } catch (error) {
    await queries.deletePasswordResetCodes(user.id);
    console.error('No se pudo enviar el código de recuperación:', error);
    // Se conserva la misma respuesta para no revelar si el correo está registrado.
    return { ok: true, message: PASSWORD_RESET_MESSAGE };
  }
}

export async function resetPassword(
  email: string,
  code: string,
  password: string,
): Promise<{ ok: true; message: string }> {
  const user = await queries.findUserByEmail(email.trim().toLowerCase());
  if (!user || (user.provider && user.provider !== 'local')) {
    throw new Error('Código inválido o vencido. Solicita uno nuevo.');
  }

  const resetCode = await queries.findLatestPasswordResetCode(user.id);
  const candidateHash = hashPasswordResetCode(user.id, code);
  const storedHash = resetCode ? Buffer.from(resetCode.codeHash, 'hex') : Buffer.alloc(0);
  const candidate = Buffer.from(candidateHash, 'hex');
  const matches = storedHash.length === candidate.length && timingSafeEqual(storedHash, candidate);
  const isUsable = resetCode && resetCode.expiresAt > new Date() &&
    resetCode.attempts < env.EMAIL_VERIFICATION_MAX_ATTEMPTS;

  if (!isUsable || !matches) {
    if (resetCode && resetCode.expiresAt > new Date() &&
      resetCode.attempts < env.EMAIL_VERIFICATION_MAX_ATTEMPTS) {
      await queries.incrementPasswordResetAttempts(resetCode.id);
    }
    throw new Error('Código inválido o vencido. Solicita uno nuevo.');
  }

  const passwordHash = await hashPassword(password);
  const changed = await queries.consumePasswordResetCode(
    resetCode.id,
    user.id,
    candidateHash,
    passwordHash,
  );
  if (!changed) throw new Error('Código inválido o vencido. Solicita uno nuevo.');

  return { ok: true, message: 'Contraseña actualizada correctamente.' };
}
