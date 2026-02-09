import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StatsResponse } from '../models';

vi.mock('../repositories/stats-repository', () => ({
	getMyStats: vi.fn(),
}));

import { getMyStats } from '../repositories/stats-repository';
import { useStatsStore } from '../stores/useStatsStore';

const mockGetMyStats = vi.mocked(getMyStats);

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en' },
	}),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Button: ({
		children,
		disabled,
		type,
		onClick,
		size,
		variant,
	}: {
		children: ReactNode;
		disabled?: boolean;
		type?: string;
		onClick?: () => void;
		size?: string;
		variant?: string;
	}) => (
		<button
			disabled={disabled}
			type={type as 'button' | 'submit' | 'reset' | undefined}
			onClick={onClick}
			data-testid={type === 'submit' ? 'apply-button' : 'reset-button'}
		>
			{children}
		</button>
	),
	Checkbox: ({
		checked,
		onChange,
	}: {
		checked: boolean;
		onChange: (e: { target: { checked: boolean } }) => void;
	}) => (
		<input
			type="checkbox"
			data-testid="all-time-checkbox"
			checked={checked}
			onChange={onChange}
		/>
	),
	Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
		<input {...props} data-testid={`input-${props.placeholder}`} />
	),
	Card: ({
		children,
		'data-testid': testId,
	}: {
		children: ReactNode;
		'data-testid'?: string;
	}) => <div data-testid={testId ?? 'stats-card'}>{children}</div>,
	CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardTitle: ({
		children,
		className,
	}: {
		children: ReactNode;
		className?: string;
	}) => <h3 className={className}>{children}</h3>,
	CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	ChartConfig: {},
	ChartContainer: ({ children }: { children: ReactNode }) => (
		<div data-testid="chart-container">{children}</div>
	),
	ChartLegend: () => <div data-testid="chart-legend" />,
	ChartLegendContent: () => <div />,
	ChartTooltip: () => <div />,
	ChartTooltipContent: () => <div />,
}));

vi.mock('recharts', () => ({
	PieChart: ({ children }: { children: ReactNode }) => (
		<div data-testid="pie-chart">{children}</div>
	),
	Pie: ({ children }: { children: ReactNode }) => (
		<div data-testid="pie">{children}</div>
	),
	Cell: () => <div data-testid="cell" />,
}));

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

import { Stats } from './Stats';

describe('Stats Integration Tests', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		await act(() => {
			useStatsStore.setState({
				stats: null,
				isLoading: false,
				error: null,
				filters: null,
				appliedFilters: null,
			});
		});
	});

	afterEach(async () => {
		// Flush any pending async operations to prevent leaking into next test
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
	});

	describe('initial load', () => {
		it('should fetch stats on mount and display loading state', async () => {
			let resolveStats: (value: StatsResponse) => void;
			mockGetMyStats.mockImplementation(
				() =>
					new Promise<StatsResponse>((resolve) => {
						resolveStats = resolve;
					})
			);

			render(<Stats />);
			expect(screen.getByTestId('stats-loading')).toBeInTheDocument();

			// Resolve to avoid dangling promise
			await act(async () => {
				resolveStats!(createMockStats());
			});
		});

		it('should display all stats cards after successful fetch', async () => {
			const mockStats = createMockStats();
			mockGetMyStats.mockResolvedValueOnce(mockStats);

			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('stat-total-watched')).toBeInTheDocument();
			});

			expect(screen.getByTestId('stat-unique-titles')).toBeInTheDocument();
			expect(screen.getByTestId('stat-total-rewatches')).toBeInTheDocument();
			expect(screen.getByTestId('stat-time-watched')).toBeInTheDocument();
			expect(screen.getByTestId('stat-average-rating')).toBeInTheDocument();
		});

		it('should display error on fetch failure', async () => {
			mockGetMyStats.mockRejectedValueOnce(new Error('Failed to load stats'));

			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('stats-error')).toBeInTheDocument();
			});
		});

		it('should display no stats message when stats is null after fetch', async () => {
			mockGetMyStats.mockResolvedValueOnce(null as unknown as StatsResponse);

			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('stats-no-data')).toBeInTheDocument();
			});
		});

		it('should display stats cards with correct values', async () => {
			const mockStats = createMockStats({
				summary: {
					totalWatches: 100,
					uniqueTitles: 80,
					totalRewatches: 20,
					totalMinutes: 12000,
					voteAverage: 8.2,
				},
			});
			mockGetMyStats.mockResolvedValueOnce(mockStats);

			render(<Stats />);

			await waitFor(() => {
				expect(
					screen.getByTestId('stat-total-watched-value')
				).toHaveTextContent('100');
				expect(
					screen.getByTestId('stat-unique-titles-value')
				).toHaveTextContent('80');
				expect(
					screen.getByTestId('stat-total-rewatches-value')
				).toHaveTextContent('20');
				expect(
					screen.getByTestId('stat-average-rating-value')
				).toHaveTextContent('8.2');
			});
		});
	});

	describe('StatsFilter integration', () => {
		it('should render StatsFilter when stats are loaded', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());

			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('all-time-checkbox')).toBeInTheDocument();
			});
		});

		it('should not render StatsFilter during loading', async () => {
			let resolveStats: (value: StatsResponse) => void;
			mockGetMyStats.mockImplementation(
				() =>
					new Promise<StatsResponse>((resolve) => {
						resolveStats = resolve;
					})
			);

			render(<Stats />);
			expect(screen.queryByTestId('all-time-checkbox')).not.toBeInTheDocument();

			// Resolve to avoid dangling promise
			await act(async () => {
				resolveStats!(createMockStats());
			});
		});

		it('should not render StatsFilter on error', async () => {
			mockGetMyStats.mockRejectedValueOnce(new Error('Error'));

			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('stats-error')).toBeInTheDocument();
			});

			expect(screen.queryByTestId('all-time-checkbox')).not.toBeInTheDocument();
		});

		it('should show all time checkbox as checked initially', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());

			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('stat-total-watched')).toBeInTheDocument();
				expect(screen.getByTestId('all-time-checkbox')).toBeChecked();
			});
		});

		it('should show and hide year inputs when toggling all time checkbox', async () => {
			mockGetMyStats.mockResolvedValue(createMockStats());

			const user = userEvent.setup();
			render(<Stats />);

			// Wait for stats to fully load
			await waitFor(() => {
				expect(screen.getByTestId('stat-total-watched')).toBeInTheDocument();
			});

			// Uncheck to show inputs
			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(
					screen.getByTestId('input-StatsFilter.yearFrom')
				).toBeInTheDocument();
			});

			// Re-check to hide inputs
			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(
					screen.queryByTestId('input-StatsFilter.yearFrom')
				).not.toBeInTheDocument();
			});
		});
	});

	describe('filter and apply flow', () => {
		it('should enable apply button when year filter is changed', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());

			const user = userEvent.setup();
			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('all-time-checkbox')).toBeInTheDocument();
			});

			// Uncheck all time
			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(screen.getByTestId('apply-button')).not.toBeDisabled();
			});
		});

		it('should fetch stats with year filters when apply is clicked', async () => {
			mockGetMyStats.mockResolvedValue(createMockStats());

			const user = userEvent.setup();
			render(<Stats />);

			// Wait for initial load
			await waitFor(() => {
				expect(screen.getByTestId('all-time-checkbox')).toBeInTheDocument();
			});

			// Uncheck all time to show year inputs
			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(
					screen.getByTestId('input-StatsFilter.yearFrom')
				).toBeInTheDocument();
			});

			// Type year values
			const yearFromInput = screen.getByTestId('input-StatsFilter.yearFrom');
			const yearToInput = screen.getByTestId('input-StatsFilter.yearTo');

			await user.clear(yearFromInput);
			await user.type(yearFromInput, '2020');
			await user.clear(yearToInput);
			await user.type(yearToInput, '2025');

			// Click apply
			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				// Should have been called more than just the initial fetch
				expect(mockGetMyStats.mock.calls.length).toBeGreaterThan(1);
			});
		});

		it('should reset filters when reset button is clicked', async () => {
			mockGetMyStats.mockResolvedValue(createMockStats());

			const user = userEvent.setup();
			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('all-time-checkbox')).toBeInTheDocument();
			});

			// Uncheck all time
			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(screen.getByTestId('reset-button')).not.toBeDisabled();
			});

			// Click reset
			await user.click(screen.getByTestId('reset-button'));

			// After reset, checkbox should be checked again (all time)
			await waitFor(() => {
				expect(screen.getByTestId('all-time-checkbox')).toBeChecked();
			});
		});
	});

	describe('validation', () => {
		it('should not call fetchStats when yearFrom is below 1900', async () => {
			mockGetMyStats.mockResolvedValue(createMockStats());

			const user = userEvent.setup();
			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('all-time-checkbox')).toBeInTheDocument();
			});

			// Uncheck all time
			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(
					screen.getByTestId('input-StatsFilter.yearFrom')
				).toBeInTheDocument();
			});

			const yearFromInput = screen.getByTestId('input-StatsFilter.yearFrom');
			await user.clear(yearFromInput);
			await user.type(yearFromInput, '1800');

			const callCountBeforeApply = mockGetMyStats.mock.calls.length;

			await user.click(screen.getByTestId('apply-button'));

			// Allow time for potential submission - validation should prevent fetch
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(mockGetMyStats.mock.calls.length).toBe(callCountBeforeApply);
		});

		it('should not call fetchStats when yearTo is before yearFrom', async () => {
			mockGetMyStats.mockResolvedValue(createMockStats());

			const user = userEvent.setup();
			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('all-time-checkbox')).toBeInTheDocument();
			});

			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(
					screen.getByTestId('input-StatsFilter.yearFrom')
				).toBeInTheDocument();
			});

			const yearFromInput = screen.getByTestId('input-StatsFilter.yearFrom');
			const yearToInput = screen.getByTestId('input-StatsFilter.yearTo');

			await user.clear(yearFromInput);
			await user.type(yearFromInput, '2025');
			await user.clear(yearToInput);
			await user.type(yearToInput, '2020');

			const callCountBeforeApply = mockGetMyStats.mock.calls.length;

			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				expect(screen.getByTestId('error-yearTo')).toBeInTheDocument();
			});

			expect(mockGetMyStats.mock.calls.length).toBe(callCountBeforeApply);
		});

		it('should show yearTo before yearFrom error message', async () => {
			mockGetMyStats.mockResolvedValue(createMockStats());

			const user = userEvent.setup();
			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('all-time-checkbox')).toBeInTheDocument();
			});

			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(
					screen.getByTestId('input-StatsFilter.yearFrom')
				).toBeInTheDocument();
			});

			const yearFromInput = screen.getByTestId('input-StatsFilter.yearFrom');
			const yearToInput = screen.getByTestId('input-StatsFilter.yearTo');

			await user.clear(yearFromInput);
			await user.type(yearFromInput, '2025');
			await user.clear(yearToInput);
			await user.type(yearToInput, '2020');

			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				expect(screen.getByTestId('error-yearTo')).toHaveTextContent(
					'StatsFilter.validation.yearToBeforeYearFrom'
				);
			});
		});

		it('should allow submit when yearTo equals yearFrom', async () => {
			mockGetMyStats.mockResolvedValue(createMockStats());

			const user = userEvent.setup();
			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('all-time-checkbox')).toBeInTheDocument();
			});

			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(
					screen.getByTestId('input-StatsFilter.yearFrom')
				).toBeInTheDocument();
			});

			const yearFromInput = screen.getByTestId('input-StatsFilter.yearFrom');
			const yearToInput = screen.getByTestId('input-StatsFilter.yearTo');

			await user.clear(yearFromInput);
			await user.type(yearFromInput, '2024');
			await user.clear(yearToInput);
			await user.type(yearToInput, '2024');

			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				expect(mockGetMyStats.mock.calls.length).toBeGreaterThan(1);
			});

			expect(screen.queryByTestId('error-yearFrom')).not.toBeInTheDocument();
			expect(screen.queryByTestId('error-yearTo')).not.toBeInTheDocument();
		});
	});

	describe('re-fetch with different filters', () => {
		it('should display updated stats after applying new filters', async () => {
			const initialStats = createMockStats({
				summary: {
					totalWatches: 42,
					uniqueTitles: 35,
					totalRewatches: 7,
					totalMinutes: 5040,
					voteAverage: 7.5,
				},
			});
			const filteredStats = createMockStats({
				summary: {
					totalWatches: 10,
					uniqueTitles: 8,
					totalRewatches: 2,
					totalMinutes: 1200,
					voteAverage: 8.0,
				},
			});

			mockGetMyStats
				.mockResolvedValueOnce(initialStats)
				.mockResolvedValueOnce(filteredStats);

			const user = userEvent.setup();
			render(<Stats />);

			// Wait for initial stats
			await waitFor(() => {
				expect(
					screen.getByTestId('stat-total-watched-value')
				).toHaveTextContent('42');
			});

			// Uncheck all time and apply
			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(screen.getByTestId('apply-button')).not.toBeDisabled();
			});

			await user.click(screen.getByTestId('apply-button'));

			// Wait for filtered stats
			await waitFor(() => {
				expect(
					screen.getByTestId('stat-total-watched-value')
				).toHaveTextContent('10');
				expect(
					screen.getByTestId('stat-unique-titles-value')
				).toHaveTextContent('8');
			});
		});

		it('should show error if re-fetch fails', async () => {
			mockGetMyStats
				.mockResolvedValueOnce(createMockStats())
				.mockRejectedValueOnce(new Error('Server error'));

			const user = userEvent.setup();
			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('stat-total-watched')).toBeInTheDocument();
			});

			// Uncheck all time and apply
			await user.click(screen.getByTestId('all-time-checkbox'));

			await waitFor(() => {
				expect(screen.getByTestId('apply-button')).not.toBeDisabled();
			});

			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				expect(screen.getByTestId('stats-error')).toBeInTheDocument();
			});
		});
	});

	describe('pie chart integration', () => {
		it('should render pie chart when stats have watch method data', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());

			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('pie-chart-title')).toBeInTheDocument();
			});
		});

		it('should show no data message when all watch methods are zero', async () => {
			const statsWithNoMethods = createMockStats({
				distribution: {
					byMethod: {
						cinema: 0,
						streaming: 0,
						homeVideo: 0,
						tv: 0,
						other: 0,
					},
				},
			});
			mockGetMyStats.mockResolvedValueOnce(statsWithNoMethods);

			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('pie-chart-no-data')).toBeInTheDocument();
			});
		});
	});

	describe('stats card values', () => {
		it('should display vote average with one decimal place', async () => {
			const stats = createMockStats({
				summary: {
					totalWatches: 1,
					uniqueTitles: 1,
					totalRewatches: 0,
					totalMinutes: 120,
					voteAverage: 7.56789,
				},
			});
			mockGetMyStats.mockResolvedValueOnce(stats);

			render(<Stats />);

			await waitFor(() => {
				expect(
					screen.getByTestId('stat-average-rating-value')
				).toHaveTextContent('7.6');
			});
		});

		it('should display zero values correctly', async () => {
			const stats = createMockStats({
				summary: {
					totalWatches: 0,
					uniqueTitles: 0,
					totalRewatches: 0,
					totalMinutes: 0,
					voteAverage: 0,
				},
			});
			mockGetMyStats.mockResolvedValueOnce(stats);

			render(<Stats />);

			await waitFor(() => {
				expect(
					screen.getByTestId('stat-total-watched-value')
				).toHaveTextContent('0');
				expect(
					screen.getByTestId('stat-average-rating-value')
				).toHaveTextContent('0.0');
			});
		});
	});

	describe('multiple fetch cycles', () => {
		it('should handle switching between all time and year range multiple times', async () => {
			mockGetMyStats.mockResolvedValue(createMockStats());

			const user = userEvent.setup();
			render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('all-time-checkbox')).toBeInTheDocument();
			});

			// Toggle all time off
			await user.click(screen.getByTestId('all-time-checkbox'));
			await waitFor(() => {
				expect(
					screen.getByTestId('input-StatsFilter.yearFrom')
				).toBeInTheDocument();
			});

			// Toggle all time on
			await user.click(screen.getByTestId('all-time-checkbox'));
			await waitFor(() => {
				expect(
					screen.queryByTestId('input-StatsFilter.yearFrom')
				).not.toBeInTheDocument();
			});

			// Toggle all time off again
			await user.click(screen.getByTestId('all-time-checkbox'));
			await waitFor(() => {
				expect(
					screen.getByTestId('input-StatsFilter.yearFrom')
				).toBeInTheDocument();
			});
		});
	});

	describe('component lifecycle', () => {
		it('should call fetchStats exactly once on mount', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());

			render(<Stats />);

			await waitFor(() => {
				expect(mockGetMyStats).toHaveBeenCalledTimes(1);
			});
		});

		it('should clean up properly on unmount', async () => {
			mockGetMyStats.mockResolvedValueOnce(createMockStats());

			const { unmount } = render(<Stats />);

			await waitFor(() => {
				expect(screen.getByTestId('stat-total-watched')).toBeInTheDocument();
			});

			unmount();

			expect(
				screen.queryByTestId('stat-total-watched')
			).not.toBeInTheDocument();
		});
	});
});
