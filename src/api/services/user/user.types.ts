import { z } from 'zod';
import * as schemas from './user.schemas';

export type UpdateProfileRequest = z.infer<typeof schemas.updateProfileRequestSchema>;
export type UserProfile = z.infer<typeof schemas.profileResponseSchema>;
