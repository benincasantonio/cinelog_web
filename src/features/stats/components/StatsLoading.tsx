import { Card, CardContent, CardHeader, Skeleton } from '@antoniobenincasa/ui';

export const StatsLoading = () => {
	return (
		<div className="space-y-6" data-testid="stats-loading">
			{/* Filter skeleton */}
			<div className="flex flex-col gap-7" data-testid="skeleton-filter">
				<div className="flex flex-wrap items-center gap-1">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-9 w-20 rounded-md basis-[calc(50%-0.125rem)] sm:basis-auto" />
					))}
				</div>
				<div className="flex flex-col md:flex-row items-end gap-2 md:gap-5 w-full md:w-auto">
					<div className="flex flex-col gap-0.5 w-full md:w-auto">
						<div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
							<Skeleton className="h-9 w-full md:w-32 rounded-md" />
							<Skeleton className="h-4 w-3" />
							<Skeleton className="h-9 w-full md:w-32 rounded-md" />
						</div>
					</div>
					<div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
						<Skeleton className="h-8 w-full md:w-20 rounded-md" />
						<Skeleton className="h-8 w-full md:w-20 rounded-md" />
					</div>
				</div>
			</div>

			{/* Stats cards grid skeleton */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[1, 2, 3, 4, 5].map((i) => (
					<Card key={i} data-testid="skeleton-card">
						<CardHeader>
							<Skeleton className="h-4 w-24" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-9 w-16" />
						</CardContent>
					</Card>
				))}
			</div>

			{/* Pie chart area skeleton */}
			<div
				className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
				data-testid="skeleton-chart"
			>
				<Skeleton className="h-5 w-40 mb-4" />
				<Skeleton className="h-75 w-full rounded-xl" />
			</div>
		</div>
	);
};
