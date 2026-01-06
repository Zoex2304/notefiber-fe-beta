import { z } from 'zod';

export const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters');
// Add more complexity rules if needed (uppercase, number, etc)

export const validatePassword = (password: string) => {
    return passwordSchema.safeParse(password);
};
