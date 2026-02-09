import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart } from 'recharts';
import type { ByMethod } from '../models';

interface WatchMethodPieChartProps {
	byMethod: ByMethod;
}

const COLORS = {
	cinema: 'hsl(271, 91%, 65%)', // violet
	streaming: 'hsl(217, 91%, 60%)', // blue
	homeVideo: 'hsl(142, 71%, 45%)', // green
	tv: 'hsl(38, 92%, 50%)', // orange
	other: 'hsl(0, 0%, 45%)', // gray
};

export const WatchMethodPieChart = ({ byMethod }: WatchMethodPieChartProps) => {
	const { t } = useTranslation();

	const chartConfig = {
		cinema: {
			label: t('WatchMethodPieChart.cinema'),
			color: COLORS.cinema,
		},
		streaming: {
			label: t('WatchMethodPieChart.streaming'),
			color: COLORS.streaming,
		},
		homeVideo: {
			label: t('WatchMethodPieChart.homeVideo'),
			color: COLORS.homeVideo,
		},
		tv: {
			label: t('WatchMethodPieChart.tv'),
			color: COLORS.tv,
		},
		other: {
			label: t('WatchMethodPieChart.other'),
			color: COLORS.other,
		},
	} satisfies ChartConfig;

	const chartData = [
		{ name: 'cinema', value: byMethod.cinema, fill: COLORS.cinema },
		{ name: 'streaming', value: byMethod.streaming, fill: COLORS.streaming },
		{ name: 'homeVideo', value: byMethod.homeVideo, fill: COLORS.homeVideo },
		{ name: 'tv', value: byMethod.tv, fill: COLORS.tv },
		{ name: 'other', value: byMethod.other, fill: COLORS.other },
	].filter((item) => item.value > 0);

	const total = chartData.reduce((sum, item) => sum + item.value, 0);

	if (total === 0) {
		return (
			<div
				className="flex items-center justify-center h-75 text-gray-500 dark:text-gray-400"
				data-testid="pie-chart-no-data"
			>
				{t('WatchMethodPieChart.noData')}
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
			<h3
				className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
				data-testid="pie-chart-title"
			>
				{t('WatchMethodPieChart.title')}
			</h3>
			<ChartContainer config={chartConfig} className="h-75 w-full">
				<PieChart>
					<ChartTooltip
						content={
							<ChartTooltipContent
								nameKey="name"
								formatter={(value, name) => {
									const config = chartConfig[name as keyof typeof chartConfig];
									return (
										<span>
											{config?.label}: {value} (
											{((Number(value) / total) * 100).toFixed(1)}%)
										</span>
									);
								}}
							/>
						}
					/>
					<Pie
						data={chartData}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						innerRadius={60}
						outerRadius={100}
						paddingAngle={2}
						strokeWidth={2}
						stroke="transparent"
					>
						{chartData.map((entry) => (
							<Cell key={entry.name} fill={entry.fill} />
						))}
					</Pie>
					<ChartLegend
						content={<ChartLegendContent nameKey="name" />}
						verticalAlign="bottom"
					/>
				</PieChart>
			</ChartContainer>
		</div>
	);
};
