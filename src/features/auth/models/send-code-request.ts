/**
 * Request body for POST /v1/auth/register/send-code
 *
 * Triggers sending an email verification code to the specified address
 * before the account is created.
 */
export type SendCodeRequest = {
	email: string;
};
