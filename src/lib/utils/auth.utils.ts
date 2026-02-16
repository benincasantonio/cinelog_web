/**
 * Reads CSRF token from cookie.
 */
export const getCsrfTokenFromCookie = (): string | null => {
	const cookies = document.cookie.split(';');
	const csrfCookie = cookies.find((c) => c.trim().startsWith('csrf_token='));
	if (csrfCookie) {
		return csrfCookie.split('=')[1];
	}
	return null;
};
