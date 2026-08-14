import { describe, expect, expectTypeOf, it } from 'vitest';
import {
	NOTIFICATION_ACTION_VALUES,
	type NotificationAction,
} from './notification-action';

describe('notification action', () => {
	it('exposes the supported wire values', () => {
		expect(NOTIFICATION_ACTION_VALUES).toEqual([
			'follow_request.accept',
			'follow_request.reject',
		]);
	});

	it('derives the notification action from the supported values', () => {
		expectTypeOf<NotificationAction>().toEqualTypeOf<
			'follow_request.accept' | 'follow_request.reject'
		>();
	});
});
