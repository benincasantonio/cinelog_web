import { Card, CardContent, CardHeader, CardTitle } from '@antoniobenincasa/ui';

interface StatsCardProps {
	title: string;
	value: string | number;
	testId?: string;
}

export const StatsCard = ({ title, value, testId }: StatsCardProps) => {
	return (
		<Card data-testid={testId}>
			<CardHeader>
				<CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p
					className="text-3xl font-bold text-gray-900 dark:text-white"
					data-testid={testId ? `${testId}-value` : undefined}
				>
					{value}
				</p>
			</CardContent>
		</Card>
	);
};
