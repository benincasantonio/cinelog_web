import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet, mockPatch, mockPost, mockJson } = vi.hoisted(() => ({
	mockGet: vi.fn(),
	mockPatch: vi.fn(),
	mockPost: vi.fn(),
	mockJson: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
	apiClient: {
		get: mockGet,
		patch: mockPatch,
		post: mockPost,
	},
}));

import {
	listNotifications,
	markAllNotificationsRead,
	markNotificationRead,
} from './notifications-repository';

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

describe('listNotifications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockJson.mockResolvedValue(validList);
		mockGet.mockReturnValue({ json: mockJson });
	});

	it('requests the inbox with default unreadOnly and limit', async () => {
		await expect(listNotifications()).resolves.toEqual(validList);

		expect(mockGet).toHaveBeenCalledWith('v1/notifications', {
			searchParams: {
				unreadOnly: false,
				limit: 20,
			},
		});
		expect(mockJson).toHaveBeenCalledOnce();
	});

	it('forwards unreadOnly, limit, and cursor', async () => {
		await listNotifications({
			unreadOnly: true,
			limit: 10,
			cursor: 'cursor-1',
		});

		expect(mockGet).toHaveBeenCalledWith('v1/notifications', {
			searchParams: {
				unreadOnly: true,
				limit: 10,
				cursor: 'cursor-1',
			},
		});
	});

	it('omits cursor when it is null', async () => {
		await listNotifications({ cursor: null });

		expect(mockGet).toHaveBeenCalledWith('v1/notifications', {
			searchParams: {
				unreadOnly: false,
				limit: 20,
			},
		});
	});

	it('parses the JSON body through the notification list schema', async () => {
		mockJson.mockResolvedValueOnce({
			items: [validItem, { ...validItem, id: 'bad', type: 'nope' }],
			nextCursor: null,
			unreadCount: 2,
		});

		await expect(listNotifications()).resolves.toEqual({
			items: [validItem],
			nextCursor: null,
			unreadCount: 2,
		});
	});
});

describe('notification read mutations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockJson.mockResolvedValue(validItem);
		mockPatch.mockReturnValue({ json: mockJson });
		mockPost.mockReturnValue({ json: mockJson });
	});

	it('marks one notification read without a request body and parses the response', async () => {
		const readItem = { ...validItem, readAt: '2026-07-18T11:00:00Z' };
		mockJson.mockResolvedValueOnce(readItem);

		await expect(markNotificationRead(validItem.id)).resolves.toEqual(readItem);

		expect(mockPatch).toHaveBeenCalledWith(
			`v1/notifications/${validItem.id}/read`
		);
		expect(mockJson).toHaveBeenCalledOnce();
	});

	it('rejects an invalid individual response', async () => {
		mockJson.mockResolvedValueOnce({ ...validItem, readAt: 123 });

		await expect(markNotificationRead(validItem.id)).rejects.toThrow();
	});

	it('marks all notifications read without a request body and parses the counts', async () => {
		const response = { updatedCount: 3, unreadCount: 0 };
		mockJson.mockResolvedValueOnce(response);

		await expect(markAllNotificationsRead()).resolves.toEqual(response);

		expect(mockPost).toHaveBeenCalledWith('v1/notifications/read-all');
		expect(mockJson).toHaveBeenCalledOnce();
	});

	it('rejects extra fields in the bulk response', async () => {
		mockJson.mockResolvedValueOnce({
			updatedCount: 3,
			unreadCount: 0,
			readAt: '2026-07-18T11:00:00Z',
		});

		await expect(markAllNotificationsRead()).rejects.toThrow();
	});
});
