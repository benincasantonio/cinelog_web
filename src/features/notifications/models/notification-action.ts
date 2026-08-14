export const NOTIFICATION_ACTION_VALUES = [
	'follow_request.accept',
	'follow_request.reject',
] as const;

export type NotificationAction = (typeof NOTIFICATION_ACTION_VALUES)[number];
