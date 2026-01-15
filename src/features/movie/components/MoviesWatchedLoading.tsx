import { Skeleton } from '@antoniobenincasa/ui';

export const MoviesWatchedLoading = () => {
	return (
		<div className="flex flex-col">
			{/* Year Filter Skeleton */}
			<div className="p-4 border-b border-gray-300 dark:border-gray-700">
				<div className="flex items-center gap-4">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-10 w-[180px]" />
				</div>
			</div>

			{/* Movies List Skeleton */}
			<div className="flex flex-col p-4 gap-2">
				<Skeleton className="h-4 w-32 mb-2 px-2" /> {/* Counter */}
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="flex items-center gap-4 p-3 rounded-xl border border-transparent"
					>
						<Skeleton className="w-[60px] h-[90px] shrink-0 rounded-lg" />
						<div className="flex flex-col flex-1 min-w-0 space-y-2">
							<Skeleton className="h-6 w-3/4" />
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-1 w-1 rounded-full" />
								<Skeleton className="h-4 w-20" />
							</div>
							<Skeleton className="h-4 w-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
