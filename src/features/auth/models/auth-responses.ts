import type { Locale } from '@/lib/models';

export type LoginResponse = {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
	handle: string;
	bio: string | null;
	locale: Locale;
	csrfToken: string;
};

export type RefreshResponse = {
	message: string;
	csrfToken: string;
};

export type CsrfTokenResponse = {
	csrfToken: string;
};
