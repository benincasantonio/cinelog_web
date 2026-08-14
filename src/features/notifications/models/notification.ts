import type { NotificationAction } from './notification-action';
import type { NotificationType } from './notification-type';

export type NotificationActor = {
	handle: string;
	firstName: string;
	lastName: string;
};

export type NotificationBaseResponse = {
	id: string;
	type: NotificationType;
	title: string;
	body: string;
	actor: NotificationActor | null;
	availableActions: NotificationAction[];
	readAt: string | null;
	createdAt: string;
};

export type NotificationListResponse = {
	items: NotificationBaseResponse[];
	nextCursor: string | null;
	unreadCount: number;
};

export type NotificationListRequest = {
	unreadOnly?: boolean;
	limit?: number;
	cursor?: string | null;
};
