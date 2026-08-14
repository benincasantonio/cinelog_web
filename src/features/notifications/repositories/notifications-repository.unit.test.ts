import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet, mockJson } = vi.hoisted(() => ({
	mockGet: vi.fn(),
	mockJson: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
	apiClient: {
		get: mockGet,
	},
}));

import { listNotifications } from './notifications-repository';

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
