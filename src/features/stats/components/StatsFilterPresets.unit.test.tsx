/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockStatsStore } = vi.hoisted(() => {
	// biome-ignore lint/style/noCommonJs: require is needed inside vi.hoisted
	const { create } = require('zustand');

	const mockStatsStore = create(() => ({
		activePreset: () => 'allTime' as StatsFilterPreset | null,
		applyPreset: vi.fn(),
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
			data-testid={rest['data-testid']}
			data-active={rest['data-active']?.toString()}
		>
			{children}
		</button>
	),
}));

import type { StatsFilterPreset } from '../models';
import { StatsFilterPresets } from './StatsFilterPresets';

describe('StatsFilterPresets', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockStatsStore.setState({
			activePreset: () => 'allTime' as StatsFilterPreset | null,
			applyPreset: vi.fn(),
		});
	});

	it('should render all preset buttons (no Custom button)', () => {
		render(<StatsFilterPresets />);

		expect(screen.getByTestId('preset-allTime')).toBeInTheDocument();
		expect(screen.getByTestId('preset-thisYear')).toBeInTheDocument();
		expect(screen.getByTestId('preset-lastYear')).toBeInTheDocument();
		expect(screen.getByTestId('preset-last5Years')).toBeInTheDocument();
		expect(screen.queryByTestId('preset-custom')).not.toBeInTheDocument();
	});

	it('should call applyPreset when This Year button is clicked', async () => {
		const mockApplyPreset = vi.fn();
		mockStatsStore.setState({
			...mockStatsStore.getState(),
			applyPreset: mockApplyPreset,
		});

		const user = userEvent.setup();
		render(<StatsFilterPresets />);

		await user.click(screen.getByTestId('preset-thisYear'));
		expect(mockApplyPreset).toHaveBeenCalledWith('thisYear');
	});

	it('should call applyPreset when Last Year button is clicked', async () => {
		const mockApplyPreset = vi.fn();
		mockStatsStore.setState({
			...mockStatsStore.getState(),
			applyPreset: mockApplyPreset,
		});

		const user = userEvent.setup();
		render(<StatsFilterPresets />);

		await user.click(screen.getByTestId('preset-lastYear'));
		expect(mockApplyPreset).toHaveBeenCalledWith('lastYear');
	});

	it('should call applyPreset when All Time button is clicked', async () => {
		const mockApplyPreset = vi.fn();
		mockStatsStore.setState({
			...mockStatsStore.getState(),
			applyPreset: mockApplyPreset,
		});

		const user = userEvent.setup();
		render(<StatsFilterPresets />);

		await user.click(screen.getByTestId('preset-allTime'));
		expect(mockApplyPreset).toHaveBeenCalledWith('allTime');
	});

	it('should call applyPreset when Last 5 Years button is clicked', async () => {
		const mockApplyPreset = vi.fn();
		mockStatsStore.setState({
			...mockStatsStore.getState(),
			applyPreset: mockApplyPreset,
		});

		const user = userEvent.setup();
		render(<StatsFilterPresets />);

		await user.click(screen.getByTestId('preset-last5Years'));
		expect(mockApplyPreset).toHaveBeenCalledWith('last5Years');
	});

	it('should highlight This Year button when activePreset is thisYear', () => {
		mockStatsStore.setState({
			...mockStatsStore.getState(),
			activePreset: () => 'thisYear',
		});

		render(<StatsFilterPresets />);
		expect(screen.getByTestId('preset-thisYear')).toHaveAttribute(
			'data-active',
			'true'
		);
	});

	it('should highlight Last Year button when activePreset is lastYear', () => {
		mockStatsStore.setState({
			...mockStatsStore.getState(),
			activePreset: () => 'lastYear',
		});

		render(<StatsFilterPresets />);
		expect(screen.getByTestId('preset-lastYear')).toHaveAttribute(
			'data-active',
			'true'
		);
	});

	it('should highlight Last 5 Years button when activePreset is last5Years', () => {
		mockStatsStore.setState({
			...mockStatsStore.getState(),
			activePreset: () => 'last5Years',
		});

		render(<StatsFilterPresets />);
		expect(screen.getByTestId('preset-last5Years')).toHaveAttribute(
			'data-active',
			'true'
		);
	});

	it('should not highlight any preset button when activePreset is allTime', () => {
		render(<StatsFilterPresets />);

		expect(screen.getByTestId('preset-thisYear')).toHaveAttribute(
			'data-active',
			'false'
		);
		expect(screen.getByTestId('preset-lastYear')).toHaveAttribute(
			'data-active',
			'false'
		);
		expect(screen.getByTestId('preset-last5Years')).toHaveAttribute(
			'data-active',
			'false'
		);
	});

	it('should highlight All Time button when activePreset is allTime', () => {
		render(<StatsFilterPresets />);
		expect(screen.getByTestId('preset-allTime')).toHaveAttribute(
			'data-active',
			'true'
		);
	});
});
