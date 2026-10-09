import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Enter your email address.')
  .email('Enter a valid email address.')
  .max(254);

export const passwordRules = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(128, 'Use 128 characters or fewer.')
  .regex(/[A-Za-z]/, 'Include at least one letter.')
  .regex(/[0-9]/, 'Include at least one number.');

/**
 * Registration. There is deliberately no `role` key: Zod strips unknown keys,
 * so a role sent from the browser never reaches the database call.
 */
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.').max(80),
    email: emailSchema,
    password: passwordRules,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  portal: z.enum(['client', 'admin']).default('client'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** Live strength hint for the register form (0 to 4). */
export function passwordStrength(pw: string): { score: number; label: string } {
  if (pw.length === 0) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Za-z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) && /[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] };
}
