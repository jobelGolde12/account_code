import { z } from 'zod';

export function cleanText(input: string): string {
  return input
    .trim()
    .replace(/[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F]/g, "'")
    .replace(/[\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ');
}

export const accountSchema = z.object({
  code: z.string().min(1, 'Code is required').transform(cleanText),
  accountName: z.string().min(1, 'Account name is required').transform(cleanText),
});

export const validateCodeSchema = z.object({
  code: z.string().min(1, 'Code is required').transform(cleanText),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().trim().min(1, 'Password is required'),
});

export type AccountInput = z.infer<typeof accountSchema>;
export type ValidateCodeInput = z.infer<typeof validateCodeSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
