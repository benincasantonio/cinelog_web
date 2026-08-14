import { describe, expect, expectTypeOf, it } from 'vitest';
import {
	NOTIFICATION_TYPE_VALUES,
	type NotificationType,
} from './notification-type';

describe('notification type', () => {
	it('exposes the supported wire values', () => {
		expect(NOTIFICATION_TYPE_VALUES).toEqual([
			'follow.started',
			'follow.requested',
			'follow.accepted',
		]);
	});

	it('derives the notification type from the supported values', () => {
		expectTypeOf<NotificationType>().toEqualTypeOf<
			'follow.started' | 'follow.requested' | 'follow.accepted'
		>();
	});
});
