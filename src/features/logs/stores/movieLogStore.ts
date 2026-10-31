import { create } from 'zustand';
import { createLatestRequestGuard } from '@/lib/utilities/latest-request-guard';
import type { LogCreateRequest, LogUpdateRequest } from '../models';
import {
	createLog,
	deleteLog as deleteLogRepository,
	updateLog,
} from '../repositories';

interface MovieLogStore {
	isLoading: boolean;
	isDeleteMovieLogLoading: boolean;
	error: string | null;
	createLog: (data: LogCreateRequest) => Promise<void>;
	updateLog: (logId: string, data: LogUpdateRequest) => Promise<void>;
	deleteLog: (logId: string) => Promise<void>;
	clearError: () => void;
	reset: () => void;
}

export const useMovieLogStore = create<MovieLogStore>((set) => {
	const guard = createLatestRequestGuard();
	return {
		isLoading: false,
		isDeleteMovieLogLoading: false,
		error: null,
		async createLog(data: LogCreateRequest) {
			const requestId = guard.start();
			set({
				isLoading: true,
				error: null,
			});
			try {
				await createLog(data);
			} catch (error) {
				const message =
					error instanceof Error ? error.message : 'Failed to create movie log';
				if (!guard.isStale(requestId)) set({ error: message });
				console.error(error);
				throw error;
			} finally {
				if (!guard.isStale(requestId))
					set({
						isLoading: false,
					});
			}
		},
		async updateLog(logId: string, data: LogUpdateRequest) {
			const requestId = guard.start();
			set({
				isLoading: true,
				error: null,
			});

			try {
				await updateLog(logId, data);
			} catch (error) {
				const message =
					error instanceof Error ? error.message : 'Failed to update movie log';
				if (!guard.isStale(requestId)) set({ error: message });
				console.error(error);
				throw error;
			} finally {
				if (!guard.isStale(requestId))
					set({
						isLoading: false,
					});
			}
		},
		async deleteLog(logId: string) {
			set({
				isDeleteMovieLogLoading: true,
				error: null,
			});

			try {
				await deleteLogRepository(logId);
			} catch (error) {
				const message =
					error instanceof Error ? error.message : 'Failed to delete movie log';
				set({ error: message });
				console.error(error);
				throw error;
			} finally {
				set({
					isDeleteMovieLogLoading: false,
				});
			}
		},
		clearError: () => set({ error: null }),
		reset: () => {
			guard.invalidate();
			set({ isLoading: false, error: null });
		},
	};
});
