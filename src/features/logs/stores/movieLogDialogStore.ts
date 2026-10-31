import { create } from 'zustand';
import type { LogListItem } from '../models';
import { useMovieLogStore } from './movieLogStore';

type PrefilledMovie = {
	movieId: string;
	title: string;
} | null;

type MovieLogDialogStore = {
	isOpen: boolean;
	sessionId: number;
	/**
	 * This is the movie that will be prefilled in the dialog.
	 * It can be used only in create mode.
	 */
	prefilledMovie: PrefilledMovie;
	/**
	 * This contains all the data in order to prefill the form to edit the log
	 *
	 */
	movieToEdit: LogListItem | null;
	open: (options?: MovieDialogOptions) => void;
	close: () => void;
	clearPrefilledMovie: () => void;
	triggerCount: number;
	triggerUpdate: () => void;
};

type MovieDialogOptions = {
	prefilledMovie?: PrefilledMovie;
	movieToEdit?: LogListItem;
};

export const useMovieLogDialogStore = create<MovieLogDialogStore>((set) => ({
	isOpen: false,
	sessionId: 0,
	prefilledMovie: null,
	movieToEdit: null,
	open: (options?: MovieDialogOptions) => {
		if (options?.movieToEdit && options?.prefilledMovie) {
			throw new Error(
				'Cannot open dialog with both movieToEdit and prefilledMovie'
			);
		}

		useMovieLogStore.getState().reset();
		set((state) => ({
			sessionId: state.sessionId + 1,
			isOpen: true,
			prefilledMovie: options?.prefilledMovie || null,
			movieToEdit: options?.movieToEdit || null,
		}));
	},
	close: () => {
		useMovieLogStore.getState().reset();
		set((state) => ({
			sessionId: state.sessionId + 1,
			isOpen: false,
			prefilledMovie: null,
			movieToEdit: null,
		}));
	},
	clearPrefilledMovie: () => set({ prefilledMovie: null }),
	triggerCount: 0,
	triggerUpdate: () => {
		set((state) => ({ ...state, triggerCount: state.triggerCount + 1 }));
	},
}));
