import { z } from 'zod';
import {
    userCancellationRequestSchema,
    userCancellationResponseSchema,
    userCancellationListItemSchema,
} from './cancellation.schemas';

export type UserCancellationRequest = z.infer<typeof userCancellationRequestSchema>;
export type UserCancellationResponse = z.infer<typeof userCancellationResponseSchema>;
export type UserCancellationListItem = z.infer<typeof userCancellationListItemSchema>;
