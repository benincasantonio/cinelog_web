import { apiClient } from '@/lib/api/client';
import type {
	MarkAllNotificationsReadResponse,
	NotificationBaseResponse,
	NotificationListRequest,
	NotificationListResponse,
} from '../models';
import {
	notificationItemSchema,
	parseMarkAllNotificationsReadResponse,
	parseNotificationListResponse,
} from '../schemas';

export const DEFAULT_NOTIFICATION_PAGE_SIZE = 20;

export const listNotifications = async (
	params: NotificationListRequest = {}
): Promise<NotificationListResponse> => {
	const searchParams: {
		unreadOnly: boolean;
		limit: number;
		cursor?: string;
	} = {
		unreadOnly: params.unreadOnly ?? false,
		limit: params.limit ?? DEFAULT_NOTIFICATION_PAGE_SIZE,
	};

	if (params.cursor) {
		searchParams.cursor = params.cursor;
	}

	const json = await apiClient.get('v1/notifications', { searchParams }).json();

	return parseNotificationListResponse(json);
};

export const markNotificationRead = async (
	notificationId: string
): Promise<NotificationBaseResponse> => {
	const json = await apiClient
		.patch(`v1/notifications/${notificationId}/read`)
		.json();

	return notificationItemSchema.parse(json);
};

export const markAllNotificationsRead =
	async (): Promise<MarkAllNotificationsReadResponse> => {
		const json = await apiClient.post('v1/notifications/read-all').json();

		return parseMarkAllNotificationsReadResponse(json);
	};
