import { z } from 'zod';

export const createRateMovieSchema = (ratingMessage: string) =>
	z.object({
		rating: z.number().min(1, ratingMessage),
		comment: z.string().optional(),
	});
export type RateMovieFormData = z.infer<
	ReturnType<typeof createRateMovieSchema>
>;
