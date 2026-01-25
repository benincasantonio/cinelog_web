import { create } from 'zustand';
import type { LogListItem } from '../models';

type PrefilledMovie = {
	tmdbId: number;
	title: string;
} | null;

type MovieLogDialogStore = {
	isOpen: boolean;
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
	setIsOpen: (isOpen: boolean) => void;
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
	prefilledMovie: null,
	movieToEdit: null,
	setIsOpen: (isOpen) =>
		set({ isOpen, prefilledMovie: isOpen ? undefined : null }),
	open: (options?: MovieDialogOptions) => {
		if (options?.movieToEdit && options?.prefilledMovie) {
			throw new Error(
				'Cannot open dialog with both movieToEdit and prefilledMovie'
			);
		}

		set({
			isOpen: true,
			prefilledMovie: options?.prefilledMovie || null,
			movieToEdit: options?.movieToEdit || null,
		});
	},
	close: () => set({ isOpen: false, prefilledMovie: null, movieToEdit: null }),
	clearPrefilledMovie: () => set({ prefilledMovie: null }),
	triggerCount: 0,
	triggerUpdate: () => {
		set((state) => ({ ...state, triggerCount: state.triggerCount + 1 }));
	},
}));
