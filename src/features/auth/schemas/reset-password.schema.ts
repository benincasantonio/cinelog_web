import { z } from 'zod';

export const resetPasswordSchema = (passwordsMismatchMessage: string) =>
	z
		.object({
			code: z.string().nonempty(),
			newPassword: z.string().min(8).nonempty(),
			confirmPassword: z.string().nonempty(),
		})
		.strict()
		.refine((data) => data.newPassword === data.confirmPassword, {
			message: passwordsMismatchMessage,
			path: ['confirmPassword'],
		});

export type ResetPasswordSchema = z.infer<
	ReturnType<typeof resetPasswordSchema>
>;
