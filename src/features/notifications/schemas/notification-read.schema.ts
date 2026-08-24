import { z } from 'zod';
import type { MarkAllNotificationsReadResponse } from '../models';

export const markAllNotificationsReadResponseSchema = z
	.object({
		updatedCount: z.number().int().nonnegative(),
		unreadCount: z.number().int().nonnegative(),
	})
	.strict();

export const parseMarkAllNotificationsReadResponse = (
	data: unknown
): MarkAllNotificationsReadResponse =>
	markAllNotificationsReadResponseSchema.parse(data);
