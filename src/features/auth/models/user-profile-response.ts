import type { ProfileVisibility } from '@/lib/models';

export type UserProfileResponse = {
	firstName: string;
	lastName: string;
	handle: string;
	bio?: string;
	profileVisibility: ProfileVisibility;
	dateOfBirth: string;
};
