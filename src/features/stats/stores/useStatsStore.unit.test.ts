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
