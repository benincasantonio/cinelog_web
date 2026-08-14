export const NOTIFICATION_TYPE_VALUES = [
	'follow.started',
	'follow.requested',
	'follow.accepted',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPE_VALUES)[number];
