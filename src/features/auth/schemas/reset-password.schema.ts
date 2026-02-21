import { z } from 'zod';

export const resetPasswordSchema = (passwordsMismatchMessage: string) =>
	z
		.object({
			code: z.string().min(1),
			newPassword: z.string().min(8),
			confirmPassword: z.string().min(8),
		})
		.strict()
		.refine((data) => data.newPassword === data.confirmPassword, {
			message: passwordsMismatchMessage,
			path: ['confirmPassword'],
		});

export type ResetPasswordSchema = z.infer<
	ReturnType<typeof resetPasswordSchema>
>;
