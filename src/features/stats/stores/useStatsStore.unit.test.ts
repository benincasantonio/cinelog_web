import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStatsStore } from './useStatsStore';

vi.mock('../repositories/stats-repository', () => ({
	getMyStats: vi.fn(),
}));

import type { StatsResponse } from '../models';
import { getMyStats } from '../repositories/stats-repository';

const mockGetMyStats = vi.mocked(getMyStats);

const createMockStats = (
	overrides?: Partial<StatsResponse>
): StatsResponse => ({
	summary: {
		totalWatches: 42,
		uniqueTitles: 35,
		totalRewatches: 7,
		totalMinutes: 5040,
		voteAverage: 7.5,
	},
	distribution: {
		byMethod: {
			cinema: 10,
			streaming: 20,
			homeVideo: 5,
			tv: 4,
			other: 3,
		},
	},
	pace: {
		onTrackFor: 100,
		currentAverage: 3.5,
		daysSinceLastLog: 2,
	},
	...overrides,
});

const getState = () => useStatsStore.getState();

describe('useStatsStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useStatsStore.setState({
			stats: null,
			isLoading: false,
			error: null,
			filters: null,
			appliedFilters: null,
		});
	});

	describe('initial state', () => {
		it('should have correct initial values', () => {
			const state = getState();
			expect(state.stats).toBeNull();
			expect(state.isLoading).toBe(false);
			expect(state.error).toBeNull();
			expect(state.filters).toBeNull();
			expect(state.appliedFilters).toBeNull();
		});
	});

	describe('isAllTime', () => {
		it('should return true when filters is null', () => {
			expect(getState().isAllTime()).toBe(true);
		});

		it('should return true when filters has no yearFrom and no yearTo', () => {
			useStatsStore.setState({ filters: {} });
			expect(getState().isAllTime()).toBe(true);
		});

		it('should return true when filters has undefined yearFrom and yearTo', () => {
			useStatsStore.setState({
				filters: { yearFrom: undefined, yearTo: undefined },
			});
			expect(getState().isAllTime()).toBe(true);
		});

		it('should return false when yearFrom is set', () => {
			useStatsStore.setState({ filters: { yearFrom: 2024 } });
			expect(getState().isAllTime()).toBe(false);
		});

		it('should return false when yearTo is set', () => {
			useStatsStore.setState({ filters: { yearTo: 2025 } });
			expect(getState().isAllTime()).toBe(false);
		});

		it('should return false when both yearFrom and yearTo are set', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2020, yearTo: 2025 },
			});
			expect(getState().isAllTime()).toBe(false);
		});
	});

	describe('canApplyFilters', () => {
		it('should return false when both filters and appliedFilters are null', () => {
			expect(getState().canApplyFilters()).toBe(false);
		});

		it('should return false when filters equal appliedFilters', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2024, yearTo: 2025 },
				appliedFilters: { yearFrom: 2024, yearTo: 2025 },
			});
			expect(getState().canApplyFilters()).toBe(false);
		});

		it('should return true when filters differ from appliedFilters', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2023, yearTo: 2025 },
				appliedFilters: { yearFrom: 2024, yearTo: 2025 },
			});
			expect(getState().canApplyFilters()).toBe(true);
		});

		it('should return true when filters is set and appliedFilters is null', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2024 },
				appliedFilters: null,
			});
			expect(getState().canApplyFilters()).toBe(true);
		});

		it('should return true when only yearTo changed', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2024, yearTo: 2026 },
				appliedFilters: { yearFrom: 2024, yearTo: 2025 },
			});
			expect(getState().canApplyFilters()).toBe(true);
		});

		it('should return true when only yearFrom changed', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2020, yearTo: 2025 },
				appliedFilters: { yearFrom: 2024, yearTo: 2025 },
			});
			expect(getState().canApplyFilters()).toBe(true);
		});
	});

	describe('setYearFrom', () => {
		it('should set yearFrom in filters', () => {
			getState().setYearFrom(2024);
			expect(getState().filters?.yearFrom).toBe(2024);
		});

		it('should set yearFrom to undefined when called with null', () => {
			useStatsStore.setState({ filters: { yearFrom: 2024 } });
			getState().setYearFrom(null);
			expect(getState().filters?.yearFrom).toBeUndefined();
		});

		it('should preserve existing yearTo when setting yearFrom', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2020, yearTo: 2025 },
			});
			getState().setYearFrom(2022);
			expect(getState().filters?.yearFrom).toBe(2022);
			expect(getState().filters?.yearTo).toBe(2025);
		});

		it('should create filters object when filters is null', () => {
			expect(getState().filters).toBeNull();
			getState().setYearFrom(2024);
			expect(getState().filters).not.toBeNull();
			expect(getState().filters?.yearFrom).toBe(2024);
		});
	});

	describe('setYearTo', () => {
		it('should set yearTo in filters', () => {
			getState().setYearTo(2025);
			expect(getState().filters?.yearTo).toBe(2025);
		});

		it('should set yearTo to undefined when called with null', () => {
			useStatsStore.setState({ filters: { yearTo: 2025 } });
			getState().setYearTo(null);
			expect(getState().filters?.yearTo).toBeUndefined();
		});

		it('should preserve existing yearFrom when setting yearTo', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2020, yearTo: 2025 },
			});
			getState().setYearTo(2026);
			expect(getState().filters?.yearFrom).toBe(2020);
			expect(getState().filters?.yearTo).toBe(2026);
		});
	});

	describe('setAllTime', () => {
		it('should clear yearFrom and yearTo when set to true', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2020, yearTo: 2025 },
			});
			getState().setAllTime(true);
			expect(getState().filters?.yearFrom).toBeUndefined();
			expect(getState().filters?.yearTo).toBeUndefined();
		});

		it('should set yearFrom and yearTo to current year when set to false and no appliedFilters', () => {
			const currentYear = new Date().getFullYear();
			getState().setAllTime(false);
			expect(getState().filters?.yearFrom).toBe(currentYear);
			expect(getState().filters?.yearTo).toBe(currentYear);
		});

		it('should restore appliedFilters years when set to false and appliedFilters exist', () => {
			useStatsStore.setState({
				appliedFilters: { yearFrom: 2022, yearTo: 2024 },
			});
			getState().setAllTime(false);
			expect(getState().filters?.yearFrom).toBe(2022);
			expect(getState().filters?.yearTo).toBe(2024);
		});

		it('should use current year for missing appliedFilters yearFrom', () => {
			const currentYear = new Date().getFullYear();
			useStatsStore.setState({ appliedFilters: { yearTo: 2024 } });
			getState().setAllTime(false);
			expect(getState().filters?.yearFrom).toBe(currentYear);
			expect(getState().filters?.yearTo).toBe(2024);
		});

		it('should use current year for missing appliedFilters yearTo', () => {
			const currentYear = new Date().getFullYear();
			useStatsStore.setState({ appliedFilters: { yearFrom: 2022 } });
			getState().setAllTime(false);
			expect(getState().filters?.yearFrom).toBe(2022);
			expect(getState().filters?.yearTo).toBe(currentYear);
		});

		it('should make isAllTime return true after setting to true', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2020, yearTo: 2025 },
			});
			expect(getState().isAllTime()).toBe(false);
			getState().setAllTime(true);
			expect(getState().isAllTime()).toBe(true);
		});

		it('should make isAllTime return false after setting to false', () => {
			expect(getState().isAllTime()).toBe(true);
			getState().setAllTime(false);
			expect(getState().isAllTime()).toBe(false);
		});
	});

	describe('resetFilters', () => {
		it('should reset filters to match appliedFilters', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2020, yearTo: 2026 },
				appliedFilters: { yearFrom: 2024, yearTo: 2025 },
			});
			getState().resetFilters();
			expect(getState().filters).toEqual({
				yearFrom: 2024,
				yearTo: 2025,
			});
		});

		it('should reset filters to null when appliedFilters is null', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2020 },
				appliedFilters: null,
			});
			getState().resetFilters();
			expect(getState().filters).toBeNull();
		});

		it('should make canApplyFilters return false after reset', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2020, yearTo: 2026 },
				appliedFilters: { yearFrom: 2024, yearTo: 2025 },
			});
			expect(getState().canApplyFilters()).toBe(true);
			getState().resetFilters();
			expect(getState().canApplyFilters()).toBe(false);
		});

		it('should create a new object reference (not share reference with appliedFilters)', () => {
			const appliedFilters = { yearFrom: 2024, yearTo: 2025 };
			useStatsStore.setState({
				filters: { yearFrom: 2020 },
				appliedFilters,
			});
			getState().resetFilters();
			expect(getState().filters).toEqual(appliedFilters);
			expect(getState().filters).not.toBe(appliedFilters);
		});
	});

	describe('fetchStats', () => {
		it('should set isLoading to true while fetching', async () => {
			let resolveStats: (value: StatsResponse) => void;
			mockGetMyStats.mockImplementation(
				() =>
					new Promise<StatsResponse>((resolve) => {
						resolveStats = resolve;
					})
			);

			const { result } = renderHook(() => useStatsStore());

			act(() => {
				result.current.fetchStats();
			});

			expect(result.current.isLoading).toBe(true);
			expect(result.current.error).toBeNull();

			// Resolve to avoid dangling promise
			await act(async () => {
				resolveStats!(createMockStats());
			});
		});

		it('should set stats and isLoading to false on success', async () => {
			const mockStats = createMockStats();
			mockGetMyStats.mockResolvedValueOnce(mockStats);

			const { result } = renderHook(() => useStatsStore());

			await act(async () => {
				await result.current.fetchStats();
			});

			expect(result.current.stats).toEqual(mockStats);
			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBeNull();
		});

		it('should call getMyStats with current filters', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());
			useStatsStore.setState({
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			await getState().fetchStats();

			expect(mockGetMyStats).toHaveBeenCalledWith({
				yearFrom: 2024,
				yearTo: 2025,
			});
		});

		it('should call getMyStats with undefined when filters is null', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());
			await getState().fetchStats();
			expect(mockGetMyStats).toHaveBeenCalledWith(undefined);
		});

		it('should update appliedFilters to match filters on success', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());
			useStatsStore.setState({
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			await getState().fetchStats();

			expect(getState().appliedFilters).toEqual({
				yearFrom: 2024,
				yearTo: 2025,
			});
		});

		it('should set appliedFilters to null when filters is null', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());
			await getState().fetchStats();
			expect(getState().appliedFilters).toBeNull();
		});

		it('should set error message on failure', async () => {
			mockGetMyStats.mockRejectedValueOnce(new Error('Network error'));
			await getState().fetchStats();

			expect(getState().isLoading).toBe(false);
			expect(getState().error).toBe('Network error');
			expect(getState().stats).toBeNull();
		});

		it('should clear previous error on new fetch', async () => {
			mockGetMyStats.mockRejectedValueOnce(new Error('First error'));
			await getState().fetchStats();
			expect(getState().error).toBe('First error');

			mockGetMyStats.mockResolvedValueOnce(createMockStats());
			await getState().fetchStats();
			expect(getState().error).toBeNull();
		});

		it('should not update stats on failure', async () => {
			const mockStats = createMockStats();
			mockGetMyStats.mockResolvedValueOnce(mockStats);
			await getState().fetchStats();
			expect(getState().stats).toEqual(mockStats);

			mockGetMyStats.mockRejectedValueOnce(new Error('Failure'));
			await getState().fetchStats();
			expect(getState().stats).toEqual(mockStats);
		});

		it('should make canApplyFilters return false after successful fetch', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());
			useStatsStore.setState({
				filters: { yearFrom: 2024 },
				appliedFilters: null,
			});

			expect(getState().canApplyFilters()).toBe(true);
			await getState().fetchStats();
			expect(getState().canApplyFilters()).toBe(false);
		});
	});

	describe('applyPreset', () => {
		it('should set yearFrom and yearTo to current year for thisYear preset', () => {
			const currentYear = new Date().getFullYear();
			getState().applyPreset('thisYear');
			expect(getState().filters?.yearFrom).toBe(currentYear);
			expect(getState().filters?.yearTo).toBe(currentYear);
		});

		it('should set yearFrom and yearTo to previous year for lastYear preset', () => {
			const lastYear = new Date().getFullYear() - 1;
			getState().applyPreset('lastYear');
			expect(getState().filters?.yearFrom).toBe(lastYear);
			expect(getState().filters?.yearTo).toBe(lastYear);
		});

		it('should set yearFrom to 5 years ago and yearTo to current year for last5Years preset', () => {
			const currentYear = new Date().getFullYear();
			getState().applyPreset('last5Years');
			expect(getState().filters?.yearFrom).toBe(currentYear - 5);
			expect(getState().filters?.yearTo).toBe(currentYear);
		});

		it('should make isAllTime return false after applying any preset', () => {
			expect(getState().isAllTime()).toBe(true);
			getState().applyPreset('thisYear');
			expect(getState().isAllTime()).toBe(false);
		});

		it('should preserve other filter properties when applying preset', () => {
			useStatsStore.setState({ filters: { yearFrom: 2020, yearTo: 2021 } });
			getState().applyPreset('lastYear');
			const lastYear = new Date().getFullYear() - 1;
			expect(getState().filters?.yearFrom).toBe(lastYear);
			expect(getState().filters?.yearTo).toBe(lastYear);
		});

		it('should clear yearFrom and yearTo for allTime preset', () => {
			useStatsStore.setState({ filters: { yearFrom: 2020, yearTo: 2025 } });
			getState().applyPreset('allTime');
			expect(getState().filters?.yearFrom).toBeUndefined();
			expect(getState().filters?.yearTo).toBeUndefined();
			expect(getState().isAllTime()).toBe(true);
		});

		it('should set default years for custom preset', () => {
			const currentYear = new Date().getFullYear();
			getState().applyPreset('custom');
			expect(getState().filters?.yearFrom).toBe(currentYear - 1);
			expect(getState().filters?.yearTo).toBe(currentYear);
		});

		it('should call fetchStats after applying thisYear preset', async () => {
			const fetchStatsSpy = vi.spyOn(getState(), 'fetchStats');
			getState().applyPreset('thisYear');
			expect(fetchStatsSpy).toHaveBeenCalledTimes(1);
			fetchStatsSpy.mockRestore();
		});

		it('should call fetchStats after applying lastYear preset', async () => {
			const fetchStatsSpy = vi.spyOn(getState(), 'fetchStats');
			getState().applyPreset('lastYear');
			expect(fetchStatsSpy).toHaveBeenCalledTimes(1);
			fetchStatsSpy.mockRestore();
		});

		it('should call fetchStats after applying last5Years preset', async () => {
			const fetchStatsSpy = vi.spyOn(getState(), 'fetchStats');
			getState().applyPreset('last5Years');
			expect(fetchStatsSpy).toHaveBeenCalledTimes(1);
			fetchStatsSpy.mockRestore();
		});

		it('should call fetchStats after applying allTime preset', async () => {
			const fetchStatsSpy = vi.spyOn(getState(), 'fetchStats');
			getState().applyPreset('allTime');
			expect(fetchStatsSpy).toHaveBeenCalledTimes(1);
			fetchStatsSpy.mockRestore();
		});
	});

	describe('activePreset', () => {
		it('should return allTime when filters is null', () => {
			expect(getState().activePreset()).toBe('allTime');
		});

		it('should return allTime when yearFrom and yearTo are undefined', () => {
			useStatsStore.setState({ filters: {} });
			expect(getState().activePreset()).toBe('allTime');
		});

		it('should return thisYear when yearFrom and yearTo match current year', () => {
			const currentYear = new Date().getFullYear();
			useStatsStore.setState({
				filters: { yearFrom: currentYear, yearTo: currentYear },
			});
			expect(getState().activePreset()).toBe('thisYear');
		});

		it('should return lastYear when yearFrom and yearTo match previous year', () => {
			const lastYear = new Date().getFullYear() - 1;
			useStatsStore.setState({
				filters: { yearFrom: lastYear, yearTo: lastYear },
			});
			expect(getState().activePreset()).toBe('lastYear');
		});

		it('should return last5Years when range matches last 5 years', () => {
			const currentYear = new Date().getFullYear();
			useStatsStore.setState({
				filters: { yearFrom: currentYear - 5, yearTo: currentYear },
			});
			expect(getState().activePreset()).toBe('last5Years');
		});

		it('should return custom for custom year ranges', () => {
			useStatsStore.setState({
				filters: { yearFrom: 2018, yearTo: 2020 },
			});
			expect(getState().activePreset()).toBe('custom');
		});

		it('should return custom when only yearFrom is set', () => {
			useStatsStore.setState({ filters: { yearFrom: 2020 } });
			expect(getState().activePreset()).toBe('custom');
		});

		it('should return custom when only yearTo is set', () => {
			useStatsStore.setState({ filters: { yearTo: 2025 } });
			expect(getState().activePreset()).toBe('custom');
		});
	});

	describe('combined workflows', () => {
		it('should allow setting filters, fetching, then resetting', async () => {
			mockGetMyStats.mockResolvedValue(createMockStats());

			await getState().fetchStats();

			getState().setYearFrom(2024);
			getState().setYearTo(2025);
			expect(getState().canApplyFilters()).toBe(true);

			getState().resetFilters();
			expect(getState().canApplyFilters()).toBe(false);
		});

		it('should toggle between allTime and year range', () => {
			expect(getState().isAllTime()).toBe(true);

			getState().setAllTime(false);
			expect(getState().isAllTime()).toBe(false);
			expect(getState().filters?.yearFrom).toBeDefined();
			expect(getState().filters?.yearTo).toBeDefined();

			getState().setAllTime(true);
			expect(getState().isAllTime()).toBe(true);
		});

		it('should update canApplyFilters as filters change incrementally', async () => {
			mockGetMyStats.mockResolvedValue(createMockStats());

			await getState().fetchStats();
			expect(getState().canApplyFilters()).toBe(false);

			getState().setYearFrom(2024);
			expect(getState().canApplyFilters()).toBe(true);

			await getState().fetchStats();
			expect(getState().canApplyFilters()).toBe(false);

			getState().setYearTo(2026);
			expect(getState().canApplyFilters()).toBe(true);
		});
	});
});
