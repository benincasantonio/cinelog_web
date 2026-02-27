import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseStatsStore = vi.fn();
const mockHumanizeMinutes = vi.fn();

vi.mock('../stores/useStatsStore', () => ({
	useStatsStore: () => mockUseStatsStore(),
}));

vi.mock('@/lib/utilities/date-utils', () => ({
	humanizeMinutes: (...args: unknown[]) => mockHumanizeMinutes(...args),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en' },
	}),
}));

vi.mock('./StatsFilter', () => ({
	StatsFilter: () => <div data-testid="stats-filter" />,
}));

vi.mock('./StatsLoading', () => ({
	StatsLoading: () => <div data-testid="stats-loading" />,
}));

vi.mock('./StatsCard', () => ({
	StatsCard: ({ title, value, testId }: Record<string, unknown>) => (
		<div data-testid={String(testId)}>
			{String(title)}:{String(value)}
		</div>
	),
}));

vi.mock('./WatchMethodPieChart', () => ({
	WatchMethodPieChart: ({ byMethod }: Record<string, unknown>) => (
		<div data-testid="watch-method-chart">{JSON.stringify(byMethod)}</div>
	),
}));

import { Stats } from './Stats';

describe('Stats', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHumanizeMinutes.mockReturnValue('84h');
	});

	it('renders loading state', () => {
		const fetchStats = vi.fn();
		mockUseStatsStore.mockReturnValue({
			stats: null,
			isLoading: true,
			error: null,
			fetchStats,
		});

		render(<Stats />);

		expect(fetchStats).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId('stats-loading')).toBeInTheDocument();
	});

	it('renders error state', () => {
		const fetchStats = vi.fn();
		mockUseStatsStore.mockReturnValue({
			stats: null,
			isLoading: false,
			error: 'Boom',
			fetchStats,
		});

		render(<Stats />);

		expect(fetchStats).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId('stats-error')).toHaveTextContent('Error: Boom');
	});

	it('renders no-data state', () => {
		const fetchStats = vi.fn();
		mockUseStatsStore.mockReturnValue({
			stats: null,
			isLoading: false,
			error: null,
			fetchStats,
		});

		render(<Stats />);

		expect(fetchStats).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId('stats-no-data')).toHaveTextContent(
			'Stats.noStats'
		);
	});

	it('renders stats cards, filter and chart when stats exist', () => {
		const fetchStats = vi.fn();
		mockUseStatsStore.mockReturnValue({
			isLoading: false,
			error: null,
			fetchStats,
			stats: {
				summary: {
					totalWatches: 10,
					uniqueTitles: 8,
					totalRewatches: 2,
					totalMinutes: 5040,
					voteAverage: 7.56,
				},
				distribution: {
					byMethod: {
						cinema: 1,
						streaming: 2,
						homeVideo: 3,
						tv: 0,
						other: 0,
					},
				},
			},
		});

		render(<Stats />);

		expect(fetchStats).toHaveBeenCalledTimes(1);
		expect(mockHumanizeMinutes).toHaveBeenCalledWith(5040, 'en');
		expect(screen.getByTestId('stats-filter')).toBeInTheDocument();
		expect(screen.getByTestId('stat-total-watched')).toHaveTextContent(
			'Stats.totalWatched:10'
		);
		expect(screen.getByTestId('stat-unique-titles')).toHaveTextContent(
			'Stats.uniqueTitles:8'
		);
		expect(screen.getByTestId('stat-total-rewatches')).toHaveTextContent(
			'Stats.totalRewatches:2'
		);
		expect(screen.getByTestId('stat-time-watched')).toHaveTextContent(
			'Stats.timeWatched:84h'
		);
		expect(screen.getByTestId('stat-average-rating')).toHaveTextContent(
			'Stats.averageRating:7.6'
		);
		expect(screen.getByTestId('watch-method-chart')).toHaveTextContent(
			'"streaming":2'
		);
	});

	it('renders average rating as 0 when voteAverage is undefined', () => {
		const fetchStats = vi.fn();
		mockUseStatsStore.mockReturnValue({
			isLoading: false,
			error: null,
			fetchStats,
			stats: {
				summary: {
					totalWatches: 1,
					uniqueTitles: 1,
					totalRewatches: 0,
					totalMinutes: 60,
				},
				distribution: {
					byMethod: {
						cinema: 0,
						streaming: 1,
						homeVideo: 0,
						tv: 0,
						other: 0,
					},
				},
			},
		});

		render(<Stats />);
		expect(screen.getByTestId('stat-average-rating')).toHaveTextContent(
			'Stats.averageRating:0'
		);
	});
});
