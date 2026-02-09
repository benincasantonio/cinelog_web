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
		setAllTime: vi.fn(),
		setYearFrom: vi.fn(),
		setYearTo: vi.fn(),
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
	}: {
		children: ReactNode;
		disabled?: boolean;
		type?: string;
		variant?: string;
		size?: string;
		onClick?: () => void;
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
}));

import { StatsFilter } from './StatsFilter';

describe('StatsFilter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockStatsStore.setState({
			filters: null,
			appliedFilters: null,
			isAllTime: () => true,
			canApplyFilters: () => false,
			setAllTime: vi.fn(),
			setYearFrom: vi.fn(),
			setYearTo: vi.fn(),
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
			expect(screen.getByTestId('all-time-checkbox')).toBeInTheDocument();
			expect(screen.getByTestId('all-time-label')).toBeInTheDocument();
			expect(screen.getByTestId('apply-button')).toBeInTheDocument();
			expect(screen.getByTestId('reset-button')).toBeInTheDocument();
		});
	});

	describe('all time checkbox', () => {
		it('should be checked when isAllTime returns true', () => {
			render(<StatsFilter />);
			expect(screen.getByTestId('all-time-checkbox')).toBeChecked();
		});

		it('should be unchecked when isAllTime returns false', () => {
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			render(<StatsFilter />);
			expect(screen.getByTestId('all-time-checkbox')).not.toBeChecked();
		});

		it('should call setAllTime when checked', async () => {
			const mockSetAllTime = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
				setAllTime: mockSetAllTime,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.click(screen.getByTestId('all-time-checkbox'));
			expect(mockSetAllTime).toHaveBeenCalledWith(true);
		});

		it('should call setAllTime with false when unchecked', async () => {
			const mockSetAllTime = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				setAllTime: mockSetAllTime,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.click(screen.getByTestId('all-time-checkbox'));
			expect(mockSetAllTime).toHaveBeenCalledWith(false);
		});
	});

	describe('year inputs visibility', () => {
		it('should not show year inputs when isAllTime is true', () => {
			render(<StatsFilter />);

			expect(
				screen.queryByTestId('input-StatsFilter.yearFrom')
			).not.toBeInTheDocument();
			expect(
				screen.queryByTestId('input-StatsFilter.yearTo')
			).not.toBeInTheDocument();
		});

		it('should show year inputs and separator when isAllTime is false', () => {
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

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

	describe('year inputs interaction', () => {
		it('should call setYearFrom when yearFrom input changes', async () => {
			const mockSetYearFrom = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => false,
				filters: { yearFrom: undefined, yearTo: undefined },
				setYearFrom: mockSetYearFrom,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			const yearFromInput = screen.getByTestId('input-StatsFilter.yearFrom');
			await user.type(yearFromInput, '2024');

			expect(mockSetYearFrom).toHaveBeenCalled();
		});

		it('should call setYearTo when yearTo input changes', async () => {
			const mockSetYearTo = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => false,
				filters: { yearFrom: undefined, yearTo: undefined },
				setYearTo: mockSetYearTo,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			const yearToInput = screen.getByTestId('input-StatsFilter.yearTo');
			await user.type(yearToInput, '2025');

			expect(mockSetYearTo).toHaveBeenCalled();
		});

		it('should call setYearFrom with null when input is cleared', async () => {
			const mockSetYearFrom = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
				setYearFrom: mockSetYearFrom,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			const yearFromInput = screen.getByTestId('input-StatsFilter.yearFrom');
			await user.clear(yearFromInput);

			expect(mockSetYearFrom).toHaveBeenCalledWith(null);
		});

		it('should call setYearTo with null when input is cleared', async () => {
			const mockSetYearTo = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
				setYearTo: mockSetYearTo,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			const yearToInput = screen.getByTestId('input-StatsFilter.yearTo');
			await user.clear(yearToInput);

			expect(mockSetYearTo).toHaveBeenCalledWith(null);
		});

		it('should render both year inputs as number type', () => {
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			render(<StatsFilter />);

			expect(screen.getByTestId('input-StatsFilter.yearFrom')).toHaveAttribute(
				'type',
				'number'
			);
			expect(screen.getByTestId('input-StatsFilter.yearTo')).toHaveAttribute(
				'type',
				'number'
			);
		});
	});

	describe('apply button', () => {
		it('should have type submit and be disabled when canApplyFilters is false', () => {
			render(<StatsFilter />);

			const applyButton = screen.getByTestId('apply-button');
			expect(applyButton).toBeDisabled();
			expect(applyButton).toHaveAttribute('type', 'submit');
		});

		it('should be enabled when canApplyFilters is true', () => {
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				canApplyFilters: () => true,
			});

			render(<StatsFilter />);
			expect(screen.getByTestId('apply-button')).not.toBeDisabled();
		});

		it('should call fetchStats on form submit', async () => {
			const mockFetchStats = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				canApplyFilters: () => true,
				fetchStats: mockFetchStats,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				expect(mockFetchStats).toHaveBeenCalled();
			});
		});
	});

	describe('reset button', () => {
		it('should have type button and be disabled when canApplyFilters is false', () => {
			render(<StatsFilter />);

			const resetButton = screen.getByTestId('reset-button');
			expect(resetButton).toBeDisabled();
			expect(resetButton).toHaveAttribute('type', 'button');
		});

		it('should be enabled when canApplyFilters is true', () => {
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				canApplyFilters: () => true,
			});

			render(<StatsFilter />);
			expect(screen.getByTestId('reset-button')).not.toBeDisabled();
		});

		it('should call resetFilters without triggering form submit', async () => {
			const mockFetchStats = vi.fn();
			const mockResetFilters = vi.fn();
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				canApplyFilters: () => true,
				fetchStats: mockFetchStats,
				resetFilters: mockResetFilters,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.click(screen.getByTestId('reset-button'));

			expect(mockResetFilters).toHaveBeenCalled();
			expect(mockFetchStats).not.toHaveBeenCalled();
		});
	});

	describe('year input min attribute', () => {
		it('should render both year inputs with min 1900', () => {
			mockStatsStore.setState({
				...mockStatsStore.getState(),
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
				isAllTime: () => false,
				canApplyFilters: () => true,
				filters: { yearFrom: 2024, yearTo: 2025 },
				fetchStats: mockFetchStats,
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.click(screen.getByTestId('apply-button'));

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
				isAllTime: () => false,
				canApplyFilters: () => true,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.click(screen.getByTestId('apply-button'));

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
				isAllTime: () => false,
				canApplyFilters: () => true,
				filters: { yearFrom: 2025, yearTo: 2020 },
			});

			const user = userEvent.setup();
			render(<StatsFilter />);

			await user.click(screen.getByTestId('apply-button'));

			await waitFor(() => {
				expect(screen.getByTestId('error-yearTo')).toHaveTextContent(
					'StatsFilter.validation.yearToBeforeYearFrom'
				);
			});
		});
	});

	describe('state transitions', () => {
		it('should hide year inputs when switching from year range to all time', () => {
			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			const { rerender } = render(<StatsFilter />);
			expect(
				screen.getByTestId('input-StatsFilter.yearFrom')
			).toBeInTheDocument();

			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => true,
				filters: { yearFrom: undefined, yearTo: undefined },
			});

			rerender(<StatsFilter />);
			expect(
				screen.queryByTestId('input-StatsFilter.yearFrom')
			).not.toBeInTheDocument();
		});

		it('should show year inputs when switching from all time to year range', () => {
			const { rerender } = render(<StatsFilter />);
			expect(
				screen.queryByTestId('input-StatsFilter.yearFrom')
			).not.toBeInTheDocument();

			mockStatsStore.setState({
				...mockStatsStore.getState(),
				isAllTime: () => false,
				filters: { yearFrom: 2024, yearTo: 2025 },
			});

			rerender(<StatsFilter />);
			expect(
				screen.getByTestId('input-StatsFilter.yearFrom')
			).toBeInTheDocument();
		});

		it('should update button state when canApplyFilters changes', () => {
			const { rerender } = render(<StatsFilter />);
			expect(screen.getByTestId('apply-button')).toBeDisabled();
			expect(screen.getByTestId('reset-button')).toBeDisabled();

			mockStatsStore.setState({
				...mockStatsStore.getState(),
				canApplyFilters: () => true,
			});

			rerender(<StatsFilter />);
			expect(screen.getByTestId('apply-button')).not.toBeDisabled();
			expect(screen.getByTestId('reset-button')).not.toBeDisabled();
		});
	});
});
