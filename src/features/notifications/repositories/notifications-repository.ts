import { apiClient } from '@/lib/api/client';
import type {
	NotificationListRequest,
	NotificationListResponse,
} from '../models';
import { parseNotificationListResponse } from '../schemas';

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
