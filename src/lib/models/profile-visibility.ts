export const PROFILE_VISIBILITY_VALUES = [
	'public',
	'friends_only',
	'private',
] as const;

export type ProfileVisibility = (typeof PROFILE_VISIBILITY_VALUES)[number];
