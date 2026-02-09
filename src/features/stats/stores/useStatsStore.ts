import { create } from 'zustand';
import { shallowEqual } from '@/lib/utilities/shallow-equal';
import type { StatsResponse } from '../models';
import {
	type GetStatsParams,
	getMyStats,
} from '../repositories/stats-repository';

interface StatsStore {
	stats: StatsResponse | null;
	isLoading: boolean;
	error: string | null;
	filters: GetStatsParams | null;
	appliedFilters: GetStatsParams | null;
	canApplyFilters(): boolean;
	isAllTime(): boolean;
	setAllTime(value: boolean): void;
	setYearFrom: (yearFrom: number | null) => void;
	setYearTo: (yearTo: number | null) => void;
	resetFilters: () => void;
	fetchStats: (params?: GetStatsParams) => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
	stats: null,
	isLoading: false,
	error: null,
	filters: null,
	appliedFilters: null,
	canApplyFilters() {
		const filters = get().filters ?? {};
		const appliedFilters = get().appliedFilters ?? {};
		return !shallowEqual(filters, appliedFilters);
	},
	setYearFrom(yearFrom: number | null) {
		set((state) => ({
			filters: {
				...state.filters,
				yearFrom: yearFrom ?? undefined,
			},
		}));
	},
	setYearTo(yearTo: number | null) {
		set((state) => ({
			filters: {
				...state.filters,
				yearTo: yearTo ?? undefined,
			},
		}));
	},
	isAllTime() {
		const { filters } = get();

		return !filters?.yearFrom && !filters?.yearTo;
	},

	setAllTime(value: boolean) {
		if (value) {
			set((state) => ({
				filters: {
					...state.filters,
					yearFrom: undefined,
					yearTo: undefined,
				},
			}));
		} else {
			const { appliedFilters } = get();

			set((state) => ({
				filters: {
					...state.filters,
					yearFrom: appliedFilters?.yearFrom ?? new Date().getFullYear(),
					yearTo: appliedFilters?.yearTo ?? new Date().getFullYear(),
				},
			}));
		}
	},
	resetFilters() {
		const { appliedFilters } = get();
		set({ filters: appliedFilters ? { ...appliedFilters } : null });
	},
	fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const { filters } = get();
			const stats = await getMyStats(filters ?? undefined);
			set({ stats, isLoading: false, appliedFilters: filters ?? undefined });
		} catch (error) {
			set({ error: (error as Error).message, isLoading: false });
		}
	},
}));
