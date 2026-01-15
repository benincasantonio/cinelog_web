export type FirebaseUserData = {
	email: string | null;
	displayName: string | null;
	photoUrl: string | null;
	emailVerified: boolean;
	disabled: boolean;
};

export type UserResponse = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	handle: string;
	dateOfBirth: string;
	bio?: string;
	firebaseUid: string | null;
	firebaseData: FirebaseUserData | null;
};
