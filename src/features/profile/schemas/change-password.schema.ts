import { z } from 'zod';

export const changePasswordSchema = (passwordsMismatchMessage: string) =>
	z
		.object({
			currentPassword: z.string().min(8).max(128),
			newPassword: z.string().min(8).max(128),
			confirmPassword: z.string().min(8).max(128),
		})
		.strict()
		.refine((data) => data.newPassword === data.confirmPassword, {
			message: passwordsMismatchMessage,
			path: ['confirmPassword'],
		});

export type ChangePasswordSchema = z.infer<
	ReturnType<typeof changePasswordSchema>
>;
