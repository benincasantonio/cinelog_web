/**
 * Request body for POST /v1/auth/forgot-password
 *
 * Triggers sending a password reset code to the specified email address.
 */
export interface ForgotPasswordRequest {
	email: string;
}
