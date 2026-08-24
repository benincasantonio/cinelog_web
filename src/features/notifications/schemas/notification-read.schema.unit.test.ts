import { describe, expect, it } from 'vitest';
import { parseMarkAllNotificationsReadResponse } from './notification-read.schema';

describe('notification read schemas', () => {
	it('parses the strict bulk-read response', () => {
		expect(
			parseMarkAllNotificationsReadResponse({
				updatedCount: 2,
				unreadCount: 0,
			})
		).toEqual({ updatedCount: 2, unreadCount: 0 });
	});

	it('rejects missing, invalid, and extra bulk-read fields', () => {
		expect(() =>
			parseMarkAllNotificationsReadResponse({ updatedCount: 2 })
		).toThrow();
		expect(() =>
			parseMarkAllNotificationsReadResponse({
				updatedCount: -1,
				unreadCount: 0,
			})
		).toThrow();
		expect(() =>
			parseMarkAllNotificationsReadResponse({
				updatedCount: 2,
				unreadCount: 0,
				extra: true,
			})
		).toThrow();
	});
});
