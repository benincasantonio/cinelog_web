import { describe, expect, it } from 'vitest';
import {
	notificationItemSchema,
	parseNotificationListResponse,
} from './notification-list.schema';

const validItem = {
	id: 'd51b78c5-1847-49dc-826f-461c87974c60',
	type: 'follow.started',
	title: 'New follower',
	body: 'A user started following you.',
	actor: {
		handle: 'moviefan',
		firstName: 'Movie',
		lastName: 'Fan',
	},
	availableActions: [],
	readAt: null,
	createdAt: '2026-07-18T10:30:00Z',
};

const validList = {
	items: [validItem],
	nextCursor: 'cursor-1',
	unreadCount: 1,
};

describe('notificationItemSchema', () => {
	it('accepts the documented camelCase item shape', () => {
		const result = notificationItemSchema.safeParse(validItem);

		expect(result.success).toBe(true);
	});

	it('accepts a null actor and a server read timestamp', () => {
		const result = notificationItemSchema.safeParse({
			...validItem,
			actor: null,
			readAt: '2026-07-18T11:00:00Z',
			availableActions: ['follow_request.accept'],
		});

		expect(result.success).toBe(true);
	});

	it('rejects an unknown notification type', () => {
		const result = notificationItemSchema.safeParse({
			...validItem,
			type: 'movie.logged',
		});

		expect(result.success).toBe(false);
	});

	it('rejects an unknown action value', () => {
		const result = notificationItemSchema.safeParse({
			...validItem,
			availableActions: ['follow_request.snooze'],
		});

		expect(result.success).toBe(false);
	});

	it('rejects extra fields', () => {
		const result = notificationItemSchema.safeParse({
			...validItem,
			metadata: { movieId: '1' },
		});

		expect(result.success).toBe(false);
	});
});

describe('parseNotificationListResponse', () => {
	it('parses a valid list response', () => {
		expect(parseNotificationListResponse(validList)).toEqual(validList);
	});

	it('drops invalid items without failing the rest of the inbox', () => {
		const parsed = parseNotificationListResponse({
			items: [
				validItem,
				{ ...validItem, id: 'bad-type', type: 'unknown.event' },
				{
					...validItem,
					id: 'bad-action',
					availableActions: ['not.a.real.action'],
				},
			],
			nextCursor: null,
			unreadCount: 3,
		});

		expect(parsed.items).toEqual([validItem]);
		expect(parsed.nextCursor).toBeNull();
		expect(parsed.unreadCount).toBe(3);
	});

	it('rejects extra fields on the list envelope', () => {
		expect(() =>
			parseNotificationListResponse({
				...validList,
				extra: true,
			})
		).toThrow();
	});

	it('rejects a missing nextCursor', () => {
		expect(() =>
			parseNotificationListResponse({
				items: [],
				unreadCount: 0,
			})
		).toThrow();
	});
});
