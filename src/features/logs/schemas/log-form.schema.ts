import { z } from 'zod';
import { WATCHED_WHERE_VALUES } from '../models';

export const logFormSchema = z
	.object({
		tmdbId: z.number().int().positive(),
		dateWatched: z.string(),
		viewingNotes: z.string().nullable().optional(),
		watchedWhere: z.enum(WATCHED_WHERE_VALUES).nullable().optional(),
	})
	.strict();

export type LogFormSchema = z.infer<typeof logFormSchema>;
