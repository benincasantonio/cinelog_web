export interface LoginResponse {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
	handle: string;
	bio: string | null;
	csrfToken: string;
}

export interface RefreshResponse {
	message: string;
	csrfToken: string;
}

export interface CsrfTokenResponse {
	csrfToken: string;
}
