import { z } from 'zod';
import { userSchema } from '../auth/auth.schemas';

// Update Profile Request
export const updateProfileRequestSchema = z.object({
    full_name: z.string().min(2).max(100).optional(),
});

// Profile Response - Reusing user schema but might have extra fields like ai_daily_usage
export const profileResponseSchema = userSchema.extend({
    status: z.string(),
    ai_daily_usage: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
});
