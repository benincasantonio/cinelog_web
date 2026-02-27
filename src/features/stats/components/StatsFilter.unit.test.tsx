/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom/vitest';
import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

// Mock zodResolver
vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: vi.fn(),
}));

const { mockStatsStore } = vi.hoisted(() => {
	// biome-ignore lint/style/noCommonJs: require is needed inside vi.hoisted
	const { create } = require('zustand');

	const mockStatsStore = create(() => ({
		filters: null as { yearFrom?: number; yearTo?: number } | null,
		appliedFilters: null as { yearFrom?: number; yearTo?: number } | null,
		isAllTime: () => true,
		canApplyFilters: () => false,
		activePreset: () => 'allTime' as StatsFilterPreset | null,
		setAllTime: vi.fn(),
		setYearFrom: vi.fn(),
		setYearTo: vi.fn(),
		applyPreset: vi.fn(),
		fetchStats: vi.fn(),
		resetFilters: vi.fn(),
	}));

	return { mockStatsStore };
});

vi.mock('../stores', () => ({
	useStatsStore: (selector: (state: unknown) => unknown) =>
		selector(mockStatsStore.getState()),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Button: ({
		children,
		disabled,
		type,
		onClick,
		...rest
	}: {
		children: ReactNode;
		disabled?: boolean;
		type?: string;
		variant?: string;
		size?: string;
		onClick?: () => void;
		'data-testid'?: string;
		'data-active'?: boolean;
	}) => (
		<button
			disabled={disabled}
			type={type as 'button' | 'submit' | 'reset' | undefined}
			onClick={onClick}
			data-testid={
				rest['data-testid'] ??
				(type === 'submit' ? 'apply-button' : 'reset-button')
			}
			data-active={rest['data-active']?.toString()}
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
}));

import type { StatsFilterPreset } from '../models';
import { StatsFilter } from './StatsFilter';

describe('StatsFilter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockStatsStore.setState({
			filters: null,
			appliedFilters: null,
			isAllTime: () => true,
			canApplyFilters: () => false,
			activePreset: () => 'allTime' as StatsFilterPreset | null,
			setAllTime: vi.fn(),
			setYearFrom: vi.fn(),
			setYearTo: vi.fn(),
			applyPreset: vi.fn(),
			fetchStats: vi.fn(),
			resetFilters: vi.fn(),
		});

		// Default resolver mock: Success (no errors)
		(zodResolver as unknown as Mock).mockReturnValue(
			async (values: unknown) => ({ values, errors: {} })
		);
	});

	describe('rendering', () => {
		it('should render all filter elements', () => {
			const { container } = render(<StatsFilter />);

			expect(container.querySelector('form')).toBeInTheDocument();
			expect(screen.getByTestId('preset-allTime')).toBeInTheDocument();
			expect(screen.getByTestId('preset-thisYear')).toBeInTheDocument();
			expect(screen.getByTestId('preset-lastYear')).toBeInTheDocument();
			expect(screen.getByTestId('preset-last5Years')).toBeInTheDocument();
			expect(screen.queryByTestId('preset-custom')).not.toBeInTheDocument();
			expect(screen.getByTestId('apply-button')).toBeInTheDocument();
			expect(screen.getByTestId('reset-button')).toBeInTheDocument();
		});
	});

	describe('year inputs visibility', () => {
		it('should always show year inputs and separator', () => {
			render(<StatsFilter />);

			expect(
				screen.getByTestId('input-StatsFilter.yearFrom')
			).toBeInTheDocument();
			expect(
				screen.getByTestId('input-StatsFilter.yearTo')
			).toBeInTheDocument();
			expect(screen.getByTestId('year-separator')).toBeInTheDocument();
		});
	});

	/*
	 * Year inputs allow local state changes but do not trigger store updates immediately.
	 * Store updates happen only on form submission.
	 */

	describe('apply button', () => {
		it('should have type submit and be disabled initially (not dirty)', () => {
			render(<StatsFilter />);

			const applyButton = screen.getByTestId('apply-button');
			expect(applyButton).toBeDisabled();
			expect(applyButton).toHaveAttribute('type', 'submit');
		});

		it('should be enabled when form is dirty and valid', async () => {
			const user = userEvent.setup();
			render(<StatsFilter />);

			// Make it dirty and valid
			await user.type(screen.getByTestId('input-StatsFilter.yearFrom'), '2020');

			expect(screen.getByTestId('apply-button')).not.toBeDisabled();
		});

		it('should call fetchStats on form submit', async () => {
			const mockSetYearFrom = vi.fn();
			const mockSetYearTo = vi.fn();
			const mockFetchStats = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				setYearFrom: mockSetYearFrom,
				setYearTo: mockSetYearTo,
				fetchStats: mockFetchStats,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			// Type valid data to enable button
			await user.type(screen.getByTestId('input-StatsFilter.yearFrom'), '2023');

			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				expect(mockSetYearFrom).toHaveBeenCalledWith(2023);
				expect(mockFetchStats).toHaveBeenCalled();
			});
		});

		it('should submit null values when year inputs are cleared', async () => {
			const mockSetYearFrom = vi.fn();
			const mockSetYearTo = vi.fn();
			const mockFetchStats = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				filters: { yearFrom: 2023, yearTo: 2024 },
				setYearFrom: mockSetYearFrom,
				setYearTo: mockSetYearTo,
				fetchStats: mockFetchStats,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.clear(screen.getByTestId('input-StatsFilter.yearFrom'));
			await user.clear(screen.getByTestId('input-StatsFilter.yearTo'));
			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				expect(mockSetYearFrom).toHaveBeenCalledWith(null);
				expect(mockSetYearTo).toHaveBeenCalledWith(null);
				expect(mockFetchStats).toHaveBeenCalled();
			});
		});
	});

	describe('reset button', () => {
		it('should have type button and be disabled when form is not dirty', () => {
			render(<StatsFilter />);

			const resetButton = screen.getByTestId('reset-button');
			expect(resetButton).toBeDisabled();
			expect(resetButton).toHaveAttribute('type', 'button');
		});

		it('should be enabled when form is dirty', async () => {
			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.type(screen.getByTestId('input-StatsFilter.yearFrom'), '2020');

			expect(screen.getByTestId('reset-button')).not.toBeDisabled();
		});

		it('should call resetFilters without triggering form submit', async () => {
			const mockFetchStats = vi.fn();
			const mockResetFilters = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				fetchStats: mockFetchStats,
				resetFilters: mockResetFilters,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.type(screen.getByTestId('input-StatsFilter.yearFrom'), '2020');

			await user.click(screen.getByTestId('reset-button'));

			expect(mockResetFilters).toHaveBeenCalled();
			expect(mockFetchStats).not.toHaveBeenCalled();
		});
	});

	describe('year input min attribute', () => {
		it('should render both year inputs with min 1900', () => {
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				activePreset: () => 'custom',
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			render(<StatsFilter />);

			expect(screen.getByTestId('input-StatsFilter.yearFrom')).toHaveAttribute(
				'min',
				'1900'
			);
			expect(screen.getByTestId('input-StatsFilter.yearTo')).toHaveAttribute(
				'min',
				'1900'
			);
		});

		it('should render both year inputs with max set to current year', () => {
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				activePreset: () => 'custom',
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			render(<StatsFilter />);

			const currentYear = new Date().getFullYear().toString();
			expect(screen.getByTestId('input-StatsFilter.yearFrom')).toHaveAttribute(
				'max',
				currentYear
			);
			expect(screen.getByTestId('input-StatsFilter.yearTo')).toHaveAttribute(
				'max',
				currentYear
			);
		});
	});

	describe('validation errors', () => {
		it('should not show error messages when there are no errors', () => {
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				activePreset: () => 'custom',
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			render(<StatsFilter />);

			expect(screen.queryByTestId('error-yearFrom')).not.toBeInTheDocument();
			expect(screen.queryByTestId('error-yearTo')).not.toBeInTheDocument();
		});

		it('should show yearFrom error and not call fetchStats when year is below minimum', async () => {
			const mockFetchStats = vi.fn();
			(zodResolver as unknown as Mock).mockReturnValue(async () => ({
				values: {},
				errors: {
					yearFrom: { type: 'too_small', message: 'too_small' },
				},
			}));

			mockStatsStore.setState({
				...mockStatsStore.getState(),
				activePreset: () => 'custom',
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
				fetchStats: mockFetchStats,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			// Trigger validation by typing
			await user.type(screen.getByTestId('input-StatsFilter.yearFrom'), '1800');

			// Button is disabled, so we don't click. We just wait for error.
			// But wait, if we type, validation runs.
			// The existing test clicked button.
			// If we blindly click disabled button it does nothing.
			// We should just wait for error.
			await waitFor(() => {
				expect(screen.getByTestId('error-yearFrom')).toBeInTheDocument();
			});

			expect(mockFetchStats).not.toHaveBeenCalled();
		});

		it('should show yearTo error for minYear violation', async () => {
			(zodResolver as unknown as Mock).mockReturnValue(async () => ({
				values: {},
				errors: {
					yearTo: { type: 'too_small', message: 'too_small' },
				},
			}));

			mockStatsStore.setState({
				...mockStatsStore.getState(),
				activePreset: () => 'custom',
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			// Trigger validation
			await user.type(screen.getByTestId('input-StatsFilter.yearTo'), '1800');

			await waitFor(() => {
				expect(screen.getByTestId('error-yearTo')).toHaveTextContent(
					'StatsFilter.validation.minYear'
				);
			});
		});

		it('should show yearTo error for yearToBeforeYearFrom', async () => {
			(zodResolver as unknown as Mock).mockReturnValue(async () => ({
				values: {},
				errors: {
					yearTo: {
						type: 'custom',
						message: 'yearToBeforeYearFrom',
					},
				},
			}));

			mockStatsStore.setState({
				...mockStatsStore.getState(),
				activePreset: () => 'custom',
				isAllTime: () => false,
				filters: { yearFrom: 2025, yearTo: 2020 },
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			// Trigger validation
			await user.type(screen.getByTestId('input-StatsFilter.yearTo'), '2020');

			await waitFor(() => {
				expect(screen.getByTestId('error-yearTo')).toHaveTextContent(
					'StatsFilter.validation.yearToBeforeYearFrom'
				);
			});
		});

		it('should show yearFrom error for maxYear violation', async () => {
			(zodResolver as unknown as Mock).mockReturnValue(async () => ({
				values: {},
				errors: {
					yearFrom: { type: 'too_big', message: 'too_big' },
				},
			}));

			mockStatsStore.setState({
				...mockStatsStore.getState(),
				activePreset: () => 'custom',
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.type(screen.getByTestId('input-StatsFilter.yearFrom'), '2999');

			await waitFor(() => {
				expect(screen.getByTestId('error-yearFrom')).toHaveTextContent(
					'StatsFilter.validation.maxYear'
				);
			});
		});

		it('should show yearTo error for maxYear violation', async () => {
			(zodResolver as unknown as Mock).mockReturnValue(async () => ({
				values: {},
				errors: {
					yearTo: { type: 'too_big', message: 'too_big' },
				},
			}));

			mockStatsStore.setState({
				...mockStatsStore.getState(),
				activePreset: () => 'custom',
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.type(screen.getByTestId('input-StatsFilter.yearTo'), '2999');

			await waitFor(() => {
				expect(screen.getByTestId('error-yearTo')).toHaveTextContent(
					'StatsFilter.validation.maxYear'
				);
			});
		});

		it('should show yearFrom error when only yearTo is provided', async () => {
			(zodResolver as unknown as Mock).mockReturnValue(async () => ({
				values: {},
				errors: {
					yearFrom: { type: 'custom', message: 'bothYearsRequired' },
				},
			}));

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.type(screen.getByTestId('input-StatsFilter.yearTo'), '2023');
			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				expect(screen.getByTestId('error-yearFrom')).toHaveTextContent(
					'StatsFilter.validation.bothYearsRequired'
				);
			});
		});

		it('should show yearTo error when only yearFrom is provided', async () => {
			(zodResolver as unknown as Mock).mockReturnValue(async () => ({
				values: {},
				errors: {
					yearTo: { type: 'custom', message: 'bothYearsRequired' },
				},
			}));

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.type(screen.getByTestId('input-StatsFilter.yearFrom'), '2023');
			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				expect(screen.getByTestId('error-yearTo')).toHaveTextContent(
					'StatsFilter.validation.bothYearsRequired'
				);
			});
		});
	});
});
