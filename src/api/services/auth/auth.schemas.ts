import { z } from 'zod';
import { emailSchema } from '../../../utils/validators/email.validator';
import { passwordSchema } from '../../../utils/validators/password.validator';

// Request Schemas (Used for validation before sending if needed, or just type inference)
export const loginRequestSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'), // Login just needs presence
    remember_me: z.boolean().optional(),
});

export const registerRequestSchema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: emailSchema,
    password: passwordSchema,
});

export const verifyEmailRequestSchema = z.object({
    email: emailSchema,
    token: z.string().length(6, 'OTP must be 6 digits'),
});

export const forgotPasswordRequestSchema = z.object({
    email: emailSchema,
});

export const resetPasswordRequestSchema = z.object({
    token: z.string(),
    new_password: passwordSchema,
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

// Response Schemas (Used for validating API responses)
export const userSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    full_name: z.string(),
    role: z.string(),
    avatar_url: z.string().optional().nullable(),
    status: z.string().optional(),
    ai_daily_usage: z.number().optional(),
});

export const loginResponseSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string().optional(),
    user: userSchema,
});

export const registerResponseSchema = z.object({
    id: z.string(),
    email: z.string().email(),
});
