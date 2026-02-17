import { z } from 'zod';

export const forgotPasswordSchema = z
	.object({
		email: z.email(),
	})
	.strict();

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
