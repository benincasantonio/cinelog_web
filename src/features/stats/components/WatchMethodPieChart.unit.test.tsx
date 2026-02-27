import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WatchMethodPieChart } from './WatchMethodPieChart';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	ChartContainer: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="chart-container">{children}</div>
	),
	ChartLegend: () => <div data-testid="chart-legend" />,
	ChartLegendContent: () => <div data-testid="chart-legend-content" />,
	ChartTooltip: ({ content }: { content: React.ReactNode }) => (
		<div data-testid="chart-tooltip">{content}</div>
	),
	ChartTooltipContent: ({
		formatter,
	}: {
		formatter?: (value: unknown, name: unknown) => React.ReactNode;
	}) => (
		<div data-testid="chart-tooltip-content">{formatter?.(2, 'cinema')}</div>
	),
}));

vi.mock('recharts', () => ({
	PieChart: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="pie-chart">{children}</div>
	),
	Pie: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
		<div data-testid="pie" data-count={data.length}>
			{children}
		</div>
	),
	Cell: ({ fill }: { fill: string }) => (
		<div data-testid="cell" data-fill={fill} />
	),
}));

describe('WatchMethodPieChart', () => {
	it('renders a no-data state when total values are zero', () => {
		render(
			<WatchMethodPieChart
				byMethod={{ cinema: 0, streaming: 0, homeVideo: 0, tv: 0, other: 0 }}
			/>
		);

		expect(screen.getByTestId('pie-chart-no-data')).toHaveTextContent(
			'WatchMethodPieChart.noData'
		);
	});

	it('renders chart content when at least one method has values', () => {
		render(
			<WatchMethodPieChart
				byMethod={{ cinema: 2, streaming: 3, homeVideo: 0, tv: 0, other: 0 }}
			/>
		);

		expect(screen.getByTestId('pie-chart-title')).toHaveTextContent(
			'WatchMethodPieChart.title'
		);
		expect(screen.getByTestId('chart-container')).toBeInTheDocument();
		expect(screen.getByTestId('chart-legend')).toBeInTheDocument();
		expect(screen.getByTestId('chart-tooltip-content')).toHaveTextContent(
			'WatchMethodPieChart.cinema: 2 (40.0%)'
		);
		expect(screen.getAllByTestId('cell')).toHaveLength(2);
	});
});
