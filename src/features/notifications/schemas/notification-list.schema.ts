import { z } from 'zod';
import type { NotificationListResponse } from '../models';
import {
	NOTIFICATION_ACTION_VALUES,
	NOTIFICATION_TYPE_VALUES,
} from '../models';

export const notificationActorSchema = z
	.object({
		handle: z.string(),
		firstName: z.string(),
		lastName: z.string(),
	})
	.strict();

export const notificationItemSchema = z
	.object({
		id: z.string(),
		type: z.enum(NOTIFICATION_TYPE_VALUES),
		title: z.string(),
		body: z.string(),
		actor: notificationActorSchema.nullable(),
		availableActions: z.array(z.enum(NOTIFICATION_ACTION_VALUES)),
		readAt: z.string().nullable(),
		createdAt: z.string(),
	})
	.strict();

export const notificationListEnvelopeSchema = z
	.object({
		items: z.array(z.unknown()),
		nextCursor: z.string().nullable(),
		unreadCount: z.number(),
	})
	.strict();

export type NotificationListSchema = z.infer<
	typeof notificationListEnvelopeSchema
> & {
	items: z.infer<typeof notificationItemSchema>[];
};

export const parseNotificationListResponse = (
	data: unknown
): NotificationListResponse => {
	const envelope = notificationListEnvelopeSchema.parse(data);
	const items = envelope.items.flatMap((item) => {
		const result = notificationItemSchema.safeParse(item);
		return result.success ? [result.data] : [];
	});

	return {
		items,
		nextCursor: envelope.nextCursor,
		unreadCount: envelope.unreadCount,
	};
};
