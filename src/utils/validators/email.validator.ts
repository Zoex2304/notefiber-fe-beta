import { z } from 'zod';

export const emailSchema = z.string()
    .min(1, 'Email is required')
    .email('Invalid email address');

export const validateEmail = (email: string) => {
    return emailSchema.safeParse(email);
};
