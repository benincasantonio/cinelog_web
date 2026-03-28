import { z } from 'zod';

export const updateProfileSchema = (messages: {
	firstNameRequired: string;
	lastNameRequired: string;
	dateOfBirthRequired: string;
	dateOfBirthInvalidFormat: string;
	dateOfBirthInvalidDate: string;
	dateOfBirthPast: string;
}) =>
	z
		.object({
			firstName: z.string().min(1, messages.firstNameRequired),
			lastName: z.string().min(1, messages.lastNameRequired),
			bio: z.string().optional(),
			dateOfBirth: z
				.string()
				.min(1, messages.dateOfBirthRequired)
				.superRefine((val, ctx) => {
					if (val === '') return;

					const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
					if (!dateOnlyRegex.test(val)) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: messages.dateOfBirthInvalidFormat,
						});
						return;
					}

					const [yearStr, monthStr, dayStr] = val.split('-');
					const year = Number(yearStr);
					const month = Number(monthStr);
					const day = Number(dayStr);

					const date = new Date(Date.UTC(year, month - 1, day));

					if (
						year < 1900 ||
						Number.isNaN(date.getTime()) ||
						date.getUTCFullYear() !== year ||
						date.getUTCMonth() !== month - 1 ||
						date.getUTCDate() !== day
					) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: messages.dateOfBirthInvalidDate,
						});
						return;
					}

					const now = new Date();
					const todayUtcMidnight = new Date(
						Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
					);

					if (date >= todayUtcMidnight) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: messages.dateOfBirthPast,
						});
					}
				}),
		})
		.strict();

export type UpdateProfileSchema = z.infer<
	ReturnType<typeof updateProfileSchema>
>;
