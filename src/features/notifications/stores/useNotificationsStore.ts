import { create } from 'zustand';
import { createLatestRequestGuard } from '@/lib/utilities/latest-request-guard';
import type { NotificationBaseResponse } from '../models';
import {
	listNotifications,
	markAllNotificationsRead,
	markNotificationRead,
} from '../repositories';

interface NotificationsStore {
	items: NotificationBaseResponse[];
	nextCursor: string | null;
	unreadCount: number;
	unreadOnly: boolean;
	isLoading: boolean;
	isLoadingMore: boolean;
	pendingReadId: string | null;
	isMarkingAllRead: boolean;
	error: string | null;
	hasLoaded: boolean;
	loadNotifications: () => Promise<void>;
	loadMore: () => Promise<void>;
	setUnreadOnly: (unreadOnly: boolean) => Promise<void>;
	markAsRead: (notificationId: string) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	reset: () => void;
}

const initialState = {
	items: [] as NotificationBaseResponse[],
	nextCursor: null as string | null,
	unreadCount: 0,
	unreadOnly: false,
	isLoading: false,
	isLoadingMore: false,
	pendingReadId: null as string | null,
	isMarkingAllRead: false,
	error: null as string | null,
	hasLoaded: false,
};

export const useNotificationsStore = create<NotificationsStore>((set, get) => {
	const requestGuard = createLatestRequestGuard();

	return {
		...initialState,

		loadNotifications: async () => {
			const requestId = requestGuard.start();
			set({ isLoading: true, error: null });

			try {
				const result = await listNotifications({
					unreadOnly: get().unreadOnly,
				});

				if (requestGuard.isStale(requestId)) return;

				set({
					items: result.items,
					nextCursor: result.nextCursor,
					unreadCount: result.unreadCount,
					isLoading: false,
					hasLoaded: true,
				});
			} catch (error) {
				if (requestGuard.isStale(requestId)) return;

				console.error('Error loading notifications:', error);
				set({
					isLoading: false,
					error: (error as Error).message,
					hasLoaded: true,
				});
			}
		},

		loadMore: async () => {
			const { nextCursor, isLoading, isLoadingMore, unreadOnly } = get();
			if (!nextCursor || isLoading || isLoadingMore) return;

			const requestId = requestGuard.start();
			set({ isLoadingMore: true, error: null });

			try {
				const result = await listNotifications({
					unreadOnly,
					cursor: nextCursor,
				});

				if (requestGuard.isStale(requestId)) return;

				set((state) => ({
					items: [...state.items, ...result.items],
					nextCursor: result.nextCursor,
					unreadCount: result.unreadCount,
					isLoadingMore: false,
				}));
			} catch (error) {
				if (requestGuard.isStale(requestId)) return;

				console.error('Error loading more notifications:', error);
				set({
					isLoadingMore: false,
					error: (error as Error).message,
				});
			}
		},

		setUnreadOnly: async (unreadOnly) => {
			if (get().unreadOnly === unreadOnly) return;

			set({
				unreadOnly,
				items: [],
				nextCursor: null,
				hasLoaded: false,
				error: null,
			});

			await get().loadNotifications();
		},

		markAsRead: async (notificationId) => {
			const { items, pendingReadId, isMarkingAllRead } = get();
			const notification = items.find((item) => item.id === notificationId);
			if (
				pendingReadId !== null ||
				isMarkingAllRead ||
				!notification ||
				notification.readAt !== null
			) {
				return;
			}

			set({ pendingReadId: notificationId });

			try {
				const updatedNotification = await markNotificationRead(notificationId);

				set((state) => {
					const currentNotification = state.items.find(
						(item) => item.id === notificationId
					);
					const becameRead =
						currentNotification?.readAt === null &&
						updatedNotification.readAt !== null;

					return {
						items:
							state.unreadOnly && becameRead
								? state.items.filter((item) => item.id !== notificationId)
								: state.items.map((item) =>
										item.id === notificationId ? updatedNotification : item
									),
						unreadCount: becameRead
							? Math.max(0, state.unreadCount - 1)
							: state.unreadCount,
					};
				});
			} finally {
				set({ pendingReadId: null });
			}
		},

		markAllAsRead: async () => {
			const { unreadCount, pendingReadId, isMarkingAllRead } = get();
			if (unreadCount === 0 || pendingReadId !== null || isMarkingAllRead) {
				return;
			}

			set({ isMarkingAllRead: true });

			try {
				const result = await markAllNotificationsRead();
				set({
					items: [],
					nextCursor: null,
					unreadCount: result.unreadCount,
					error: null,
					hasLoaded: false,
					isMarkingAllRead: false,
				});
				await get().loadNotifications();
			} catch (error) {
				set({ isMarkingAllRead: false });
				throw error;
			}
		},

		reset: () => {
			requestGuard.invalidate();
			set(initialState);
		},
	};
});
