import { z } from 'zod';

export const MIN_YEAR = 1900;
export const MAX_YEAR = new Date().getFullYear();

export const statsFilterSchema = z
	.object({
		yearFrom: z.number().min(MIN_YEAR).max(MAX_YEAR).nullable(),
		yearTo: z.number().min(MIN_YEAR).max(MAX_YEAR).nullable(),
	})
	.superRefine((data, context) => {
		if (data.yearFrom != null && data.yearTo == null) {
			context.addIssue({
				code: 'custom',
				message: 'bothYearsRequired',
				path: ['yearTo'],
			});
		}

		if (data.yearTo != null && data.yearFrom == null) {
			context.addIssue({
				code: 'custom',
				message: 'bothYearsRequired',
				path: ['yearFrom'],
			});
		}

		if (data.yearFrom == null || data.yearTo == null) return;

		if (data.yearTo < data.yearFrom) {
			context.addIssue({
				code: 'custom',
				message: 'yearToBeforeYearFrom',
				path: ['yearTo'],
			});
		}
	});

export type StatsFilterSchema = z.infer<typeof statsFilterSchema>;
