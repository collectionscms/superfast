import { z } from 'zod';

export const updateProfileUseCaseSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
  bio: z.string().nullable(),
  image: z.string().nullable().optional(),
});

export type UpdateProfileUseCaseSchemaType = z.infer<typeof updateProfileUseCaseSchema>;
