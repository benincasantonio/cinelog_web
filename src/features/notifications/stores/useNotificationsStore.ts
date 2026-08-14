import { create } from 'zustand';
import { createLatestRequestGuard } from '@/lib/utilities/latest-request-guard';
import type { NotificationBaseResponse } from '../models';
import { listNotifications } from '../repositories';

interface NotificationsStore {
	items: NotificationBaseResponse[];
	nextCursor: string | null;
	unreadCount: number;
	unreadOnly: boolean;
	isLoading: boolean;
	isLoadingMore: boolean;
	error: string | null;
	hasLoaded: boolean;
	loadNotifications: () => Promise<void>;
	loadMore: () => Promise<void>;
	setUnreadOnly: (unreadOnly: boolean) => Promise<void>;
	reset: () => void;
}

const initialState = {
	items: [] as NotificationBaseResponse[],
	nextCursor: null as string | null,
	unreadCount: 0,
	unreadOnly: false,
	isLoading: false,
	isLoadingMore: false,
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

		reset: () => {
			requestGuard.invalidate();
			set(initialState);
		},
	};
});
