/**
 * Request body for POST /v1/auth/reset-password
 *
 * Resets the user's password using the code received via email.
 */
export interface ResetPasswordRequest {
	email: string;
	code: string;
	new_password: string;
}
