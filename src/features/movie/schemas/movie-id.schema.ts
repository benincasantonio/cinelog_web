import { z } from 'zod';

export const movieIdSchema = z.uuid();
export type MovieId = z.infer<typeof movieIdSchema>;
