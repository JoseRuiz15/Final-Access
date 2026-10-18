import { z } from 'zod';

// ============================================
// AUTH SCHEMAS (Zod)
// ============================================

// Request bodies
export const registerStartBodySchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const verifyEmailBodySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6).regex(/^\d{6}$/),
});

export const resendVerificationBodySchema = z.object({
  email: z.string().email(),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Response schemas
export const userResponseSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  createdAt: z.string().datetime(),
});

export const authResponseSchema = z.object({
  ok: z.literal(true),
  user: userResponseSchema,
});

export const messageResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  statusCode: z.number().int(),
});

// Type exports
export type RegisterStartBody = z.infer<typeof registerStartBodySchema>;
export type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>;
export type ResendVerificationBody = z.infer<typeof resendVerificationBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;