import { create } from 'zustand';
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
	updateLog: (movieId: string, data: LogUpdateRequest) => Promise<void>;
	deleteLog: (logId: string) => Promise<void>;
	clearError: () => void;
}

export const useMovieLogStore = create<MovieLogStore>((set) => ({
	isLoading: false,
	isDeleteMovieLogLoading: false,
	error: null,
	async createLog(data: LogCreateRequest) {
		set({
			isLoading: true,
			error: null,
		});
		try {
			await createLog(data);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Failed to create movie log';
			set({ error: message });
			console.error(error);
			throw error;
		} finally {
			set({
				isLoading: false,
			});
		}
	},
	async updateLog(movieId: string, data: LogUpdateRequest) {
		set({
			isLoading: true,
			error: null,
		});

		try {
			await updateLog(movieId, data);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Failed to update movie log';
			set({ error: message });
			console.error(error);
			throw error;
		} finally {
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
}));
