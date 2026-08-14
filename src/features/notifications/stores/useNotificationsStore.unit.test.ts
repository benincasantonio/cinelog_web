import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockListNotifications } = vi.hoisted(() => ({
	mockListNotifications: vi.fn(),
}));

vi.mock('../repositories/notifications-repository', () => ({
	listNotifications: (...args: unknown[]) => mockListNotifications(...args),
}));

import { useNotificationsStore } from './useNotificationsStore';

const firstPage = {
	items: [
		{
			id: 'n-1',
			type: 'follow.started',
			title: 'New follower',
			body: 'A user started following you.',
			actor: null,
			availableActions: [],
			readAt: null,
			createdAt: '2026-07-18T10:30:00Z',
		},
	],
	nextCursor: 'cursor-1',
	unreadCount: 2,
};

const secondPage = {
	items: [
		{
			id: 'n-2',
			type: 'follow.accepted',
			title: 'Follow accepted',
			body: 'Your follow request was accepted.',
			actor: null,
			availableActions: [],
			readAt: '2026-07-18T11:00:00Z',
			createdAt: '2026-07-18T09:00:00Z',
		},
	],
	nextCursor: null,
	unreadCount: 1,
};

const unreadPage = {
	items: [firstPage.items[0]],
	nextCursor: null,
	unreadCount: 1,
};

const initialState = {
	items: [],
	nextCursor: null,
	unreadCount: 0,
	unreadOnly: false,
	isLoading: false,
	isLoadingMore: false,
	error: null,
	hasLoaded: false,
};

describe('useNotificationsStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useNotificationsStore.setState(initialState);
	});

	it('has the expected initial values and no read-mutation actions', () => {
		const state = useNotificationsStore.getState();

		expect(state.items).toEqual([]);
		expect(state.nextCursor).toBeNull();
		expect(state.unreadCount).toBe(0);
		expect(state.unreadOnly).toBe(false);
		expect(state.isLoading).toBe(false);
		expect(state.isLoadingMore).toBe(false);
		expect(state.error).toBeNull();
		expect(state.hasLoaded).toBe(false);
		expect(state).not.toHaveProperty('markAsRead');
		expect(state).not.toHaveProperty('markAllAsRead');
	});

	it('loads the first page and replaces items', async () => {
		mockListNotifications.mockResolvedValueOnce(firstPage);

		const pending = useNotificationsStore.getState().loadNotifications();
		expect(useNotificationsStore.getState().isLoading).toBe(true);

		await pending;

		const state = useNotificationsStore.getState();
		expect(mockListNotifications).toHaveBeenCalledWith({ unreadOnly: false });
		expect(state.items).toEqual(firstPage.items);
		expect(state.nextCursor).toBe('cursor-1');
		expect(state.unreadCount).toBe(2);
		expect(state.isLoading).toBe(false);
		expect(state.hasLoaded).toBe(true);
		expect(state.error).toBeNull();
	});

	it('sets error when the initial load fails', async () => {
		const consoleSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		mockListNotifications.mockRejectedValueOnce(new Error('Network error'));

		await useNotificationsStore.getState().loadNotifications();

		expect(useNotificationsStore.getState().isLoading).toBe(false);
		expect(useNotificationsStore.getState().error).toBe('Network error');
		expect(useNotificationsStore.getState().hasLoaded).toBe(true);
		expect(consoleSpy).toHaveBeenCalledWith(
			'Error loading notifications:',
			expect.any(Error)
		);
		consoleSpy.mockRestore();
	});

	it('appends the next page on loadMore', async () => {
		useNotificationsStore.setState({
			...firstPage,
			unreadOnly: false,
			hasLoaded: true,
		});
		mockListNotifications.mockResolvedValueOnce(secondPage);

		await useNotificationsStore.getState().loadMore();

		expect(mockListNotifications).toHaveBeenCalledWith({
			unreadOnly: false,
			cursor: 'cursor-1',
		});
		expect(
			useNotificationsStore.getState().items.map((item) => item.id)
		).toEqual(['n-1', 'n-2']);
		expect(useNotificationsStore.getState().nextCursor).toBeNull();
		expect(useNotificationsStore.getState().isLoadingMore).toBe(false);
	});

	it('does not request another page when nextCursor is null', async () => {
		useNotificationsStore.setState({
			items: firstPage.items,
			nextCursor: null,
			hasLoaded: true,
		});

		await useNotificationsStore.getState().loadMore();

		expect(mockListNotifications).not.toHaveBeenCalled();
	});

	it('resets pagination and refetches when the unread filter changes', async () => {
		useNotificationsStore.setState({
			items: firstPage.items,
			nextCursor: 'cursor-1',
			unreadOnly: false,
			hasLoaded: true,
		});
		mockListNotifications.mockResolvedValueOnce(unreadPage);

		await useNotificationsStore.getState().setUnreadOnly(true);

		expect(useNotificationsStore.getState().unreadOnly).toBe(true);
		expect(mockListNotifications).toHaveBeenCalledWith({ unreadOnly: true });
		expect(useNotificationsStore.getState().items).toEqual(unreadPage.items);
		expect(useNotificationsStore.getState().nextCursor).toBeNull();
	});

	it('does not refetch when the unread filter is unchanged', async () => {
		await useNotificationsStore.getState().setUnreadOnly(false);

		expect(mockListNotifications).not.toHaveBeenCalled();
	});

	it('ignores an older first-page response after a newer filter fetch', async () => {
		let resolveFirst: (value: unknown) => void;
		let resolveSecond: (value: unknown) => void;
		mockListNotifications
			.mockReturnValueOnce(
				new Promise((resolve) => {
					resolveFirst = resolve;
				})
			)
			.mockReturnValueOnce(
				new Promise((resolve) => {
					resolveSecond = resolve;
				})
			);

		const firstRequest = useNotificationsStore.getState().loadNotifications();
		const secondRequest = useNotificationsStore.getState().setUnreadOnly(true);

		resolveSecond!(unreadPage);
		await secondRequest;
		resolveFirst!(firstPage);
		await firstRequest;

		expect(useNotificationsStore.getState().items).toEqual(unreadPage.items);
		expect(useNotificationsStore.getState().unreadOnly).toBe(true);
	});

	it('resets store state', () => {
		useNotificationsStore.setState({
			items: firstPage.items,
			nextCursor: 'cursor-1',
			unreadCount: 2,
			unreadOnly: true,
			isLoading: true,
			error: 'boom',
			hasLoaded: true,
		});

		useNotificationsStore.getState().reset();

		expect(useNotificationsStore.getState()).toMatchObject(initialState);
	});
});
