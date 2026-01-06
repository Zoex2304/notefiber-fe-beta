import { z } from 'zod';
import { userBillingResponseSchema, userBillingUpdateRequestSchema } from './billing.schemas';

export type UserBillingResponse = z.infer<typeof userBillingResponseSchema>;
export type UserBillingUpdateRequest = z.infer<typeof userBillingUpdateRequestSchema>;
