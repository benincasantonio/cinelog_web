import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { StatsLoading } from './StatsLoading';

vi.mock('@antoniobenincasa/ui', () => ({
	Skeleton: ({ className }: { className?: string }) => (
		<div data-testid="skeleton" className={className} />
	),
	Card: ({
		children,
		'data-testid': testId,
	}: {
		children: ReactNode;
		'data-testid'?: string;
	}) => <div data-testid={testId}>{children}</div>,
	CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('StatsLoading', () => {
	it('renders the loading container', () => {
		render(<StatsLoading />);
		expect(screen.getByTestId('stats-loading')).toBeInTheDocument();
	});

	it('renders 4 filter preset skeletons', () => {
		render(<StatsLoading />);
		const presetsRow = screen.getByTestId('skeleton-filter').children[0];
		expect(
			presetsRow.querySelectorAll('[data-testid="skeleton"]')
		).toHaveLength(4);
	});

	it('renders the filter inputs and buttons skeleton', () => {
		render(<StatsLoading />);
		expect(screen.getByTestId('skeleton-filter')).toBeInTheDocument();
	});

	it('renders 5 stat card skeletons', () => {
		render(<StatsLoading />);
		expect(screen.getAllByTestId('skeleton-card')).toHaveLength(5);
	});

	it('renders the pie chart skeleton area', () => {
		render(<StatsLoading />);
		expect(screen.getByTestId('skeleton-chart')).toBeInTheDocument();
	});
});
