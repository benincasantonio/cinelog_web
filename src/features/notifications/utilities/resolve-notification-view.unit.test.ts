import { describe, expect, it } from 'vitest';
import type { NotificationBaseResponse } from '../models';
import { NOTIFICATION_TYPE_VALUES } from '../models';
import { resolveNotificationView } from './resolve-notification-view';

const actor = {
	handle: 'moviefan',
	firstName: 'Movie',
	lastName: 'Fan',
};

const baseNotification: NotificationBaseResponse = {
	id: 'n-1',
	type: 'follow.started',
	title: 'New follower',
	body: 'A user started following you.',
	actor,
	availableActions: [],
	readAt: null,
	createdAt: '2026-07-18T10:30:00Z',
};

describe('resolveNotificationView', () => {
	it.each(
		NOTIFICATION_TYPE_VALUES
	)('resolves %s with an actor to copy and profile href', (type) => {
		expect(resolveNotificationView({ ...baseNotification, type })).toEqual({
			copyKey: `NotificationItem.${type}.withActor`,
			interpolation: { firstName: 'Movie', lastName: 'Fan' },
			actorHref: '/profile/moviefan',
		});
	});

	it.each(
		NOTIFICATION_TYPE_VALUES
	)('resolves %s without an actor to type-only copy', (type) => {
		expect(
			resolveNotificationView({ ...baseNotification, type, actor: null })
		).toEqual({
			copyKey: `NotificationItem.${type}.noActor`,
			interpolation: undefined,
			actorHref: null,
		});
	});
});
