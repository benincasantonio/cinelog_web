import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
	mockListNotifications,
	mockMarkNotificationRead,
	mockMarkAllNotificationsRead,
} = vi.hoisted(() => ({
	mockListNotifications: vi.fn(),
	mockMarkNotificationRead: vi.fn(),
	mockMarkAllNotificationsRead: vi.fn(),
}));

vi.mock('../repositories/notifications-repository', () => ({
	listNotifications: (...args: unknown[]) => mockListNotifications(...args),
	markNotificationRead: (...args: unknown[]) =>
		mockMarkNotificationRead(...args),
	markAllNotificationsRead: (...args: unknown[]) =>
		mockMarkAllNotificationsRead(...args),
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

const readItem = {
	...firstPage.items[0],
	readAt: '2026-07-18T12:34:56Z',
};

const readPage = {
	items: [readItem],
	nextCursor: null,
	unreadCount: 0,
};

const initialState = {
	items: [],
	nextCursor: null,
	unreadCount: 0,
	unreadOnly: false,
	isLoading: false,
	isLoadingMore: false,
	pendingReadId: null,
	isMarkingAllRead: false,
	error: null,
	hasLoaded: false,
};

describe('useNotificationsStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useNotificationsStore.setState(initialState);
	});

	it('has the expected initial values and read-mutation actions', () => {
		const state = useNotificationsStore.getState();

		expect(state.items).toEqual([]);
		expect(state.nextCursor).toBeNull();
		expect(state.unreadCount).toBe(0);
		expect(state.unreadOnly).toBe(false);
		expect(state.isLoading).toBe(false);
		expect(state.isLoadingMore).toBe(false);
		expect(state.pendingReadId).toBeNull();
		expect(state.isMarkingAllRead).toBe(false);
		expect(state.error).toBeNull();
		expect(state.hasLoaded).toBe(false);
		expect(state.markAsRead).toBeTypeOf('function');
		expect(state.markAllAsRead).toBeTypeOf('function');
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

	it('stores the exact individual response and serializes repeated reads', async () => {
		let resolveRead: (value: typeof readItem) => void;
		mockMarkNotificationRead.mockReturnValueOnce(
			new Promise((resolve) => {
				resolveRead = resolve;
			})
		);
		useNotificationsStore.setState({
			...firstPage,
			hasLoaded: true,
		});

		const firstRead = useNotificationsStore.getState().markAsRead('n-1');
		const repeatedRead = useNotificationsStore.getState().markAsRead('n-1');

		expect(useNotificationsStore.getState().pendingReadId).toBe('n-1');
		expect(mockMarkNotificationRead).toHaveBeenCalledOnce();

		resolveRead!(readItem);
		await Promise.all([firstRead, repeatedRead]);

		expect(useNotificationsStore.getState().items).toEqual([readItem]);
		expect(useNotificationsStore.getState().items[0].readAt).toBe(
			'2026-07-18T12:34:56Z'
		);
		expect(useNotificationsStore.getState().unreadCount).toBe(1);
		expect(useNotificationsStore.getState().pendingReadId).toBeNull();
	});

	it('removes an individually read item from the unread-only view', async () => {
		mockMarkNotificationRead.mockResolvedValueOnce(readItem);
		useNotificationsStore.setState({
			...unreadPage,
			unreadOnly: true,
			hasLoaded: true,
		});

		await useNotificationsStore.getState().markAsRead('n-1');

		expect(useNotificationsStore.getState().items).toEqual([]);
		expect(useNotificationsStore.getState().unreadCount).toBe(0);
	});

	it('does not request an individual read for missing or already-read items', async () => {
		useNotificationsStore.setState({
			items: secondPage.items,
			hasLoaded: true,
		});

		await useNotificationsStore.getState().markAsRead('missing');
		await useNotificationsStore.getState().markAsRead('n-2');

		expect(mockMarkNotificationRead).not.toHaveBeenCalled();
	});

	it('restores individual read controls and rethrows on failure', async () => {
		mockMarkNotificationRead.mockRejectedValueOnce(new Error('Read failed'));
		useNotificationsStore.setState({
			...firstPage,
			hasLoaded: true,
		});

		await expect(
			useNotificationsStore.getState().markAsRead('n-1')
		).rejects.toThrow('Read failed');

		expect(useNotificationsStore.getState().pendingReadId).toBeNull();
		expect(useNotificationsStore.getState().items).toEqual(firstPage.items);
	});

	it('applies bulk counts, resets pagination, and reloads the first page', async () => {
		mockMarkAllNotificationsRead.mockResolvedValueOnce({
			updatedCount: 2,
			unreadCount: 0,
		});
		mockListNotifications.mockResolvedValueOnce(readPage);
		useNotificationsStore.setState({
			...firstPage,
			hasLoaded: true,
		});

		const pending = useNotificationsStore.getState().markAllAsRead();
		const repeated = useNotificationsStore.getState().markAllAsRead();
		const overlappingIndividual = useNotificationsStore
			.getState()
			.markAsRead('n-1');
		expect(useNotificationsStore.getState().isMarkingAllRead).toBe(true);

		await Promise.all([pending, repeated, overlappingIndividual]);

		expect(mockMarkAllNotificationsRead).toHaveBeenCalledOnce();
		expect(mockMarkNotificationRead).not.toHaveBeenCalled();
		expect(mockListNotifications).toHaveBeenCalledWith({ unreadOnly: false });
		expect(useNotificationsStore.getState()).toMatchObject({
			items: readPage.items,
			nextCursor: null,
			unreadCount: 0,
			isMarkingAllRead: false,
		});
	});

	it('uses the standard list error state when the post-bulk refresh fails', async () => {
		const consoleSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		mockMarkAllNotificationsRead.mockResolvedValueOnce({
			updatedCount: 2,
			unreadCount: 0,
		});
		mockListNotifications.mockRejectedValueOnce(new Error('Refresh failed'));
		useNotificationsStore.setState({
			...firstPage,
			hasLoaded: true,
		});

		await expect(
			useNotificationsStore.getState().markAllAsRead()
		).resolves.toBeUndefined();

		expect(useNotificationsStore.getState()).toMatchObject({
			items: [],
			unreadCount: 0,
			isMarkingAllRead: false,
			error: 'Refresh failed',
			hasLoaded: true,
		});
		consoleSpy.mockRestore();
	});

	it('restores bulk controls and rethrows when the mutation fails', async () => {
		mockMarkAllNotificationsRead.mockRejectedValueOnce(
			new Error('Bulk failed')
		);
		useNotificationsStore.setState({
			...firstPage,
			hasLoaded: true,
		});

		await expect(
			useNotificationsStore.getState().markAllAsRead()
		).rejects.toThrow('Bulk failed');

		expect(useNotificationsStore.getState().isMarkingAllRead).toBe(false);
		expect(useNotificationsStore.getState().items).toEqual(firstPage.items);
		expect(mockListNotifications).not.toHaveBeenCalled();
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
			pendingReadId: 'n-1',
			isMarkingAllRead: true,
		});

		useNotificationsStore.getState().reset();

		expect(useNotificationsStore.getState()).toMatchObject(initialState);
	});
});
