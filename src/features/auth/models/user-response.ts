import type { Locale, ProfileVisibility } from '@/lib/models';

export type UserResponse = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	handle: string;
	dateOfBirth: string;
	bio?: string;
	locale: Locale;
	profileVisibility: ProfileVisibility;
};
