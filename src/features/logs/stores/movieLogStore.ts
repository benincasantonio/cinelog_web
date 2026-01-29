import { create } from 'zustand';
import type { LogCreateRequest, LogUpdateRequest } from '../models';
import { createLog, updateLog } from '../repositories';

interface MovieLogStore {
	isLoading: boolean;
	error: string | null;
	createLog: (data: LogCreateRequest) => Promise<void>;
	updateLog: (movieId: string, data: LogUpdateRequest) => Promise<void>;
	clearError: () => void;
}

export const useMovieLogStore = create<MovieLogStore>((set) => ({
	isLoading: false,
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
	clearError: () => set({ error: null }),
}));
