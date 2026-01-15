import type { LogListItem } from '@/features/logs/models';

// Create mock log data factory
export const createMockLog = (
	overrides?: Partial<LogListItem>
): LogListItem => ({
	id: '1',
	movieId: 'movie-1',
	tmdbId: 550,
	dateWatched: '2024-01-09',
	posterPath: '/path/to/poster.jpg',
	watchedWhere: 'cinema',
	movieRating: 8,
	movie: {
		id: 'movie-1',
		title: 'Fight Club',
		tmdbId: 550,
		posterPath: '/path/to/poster.jpg',
		releaseDate: '1999-10-15',
		overview:
			'An insomniac office worker and a devil-may-care soapmaker form an underground fight club...',
		voteAverage: 8.8,
	},
	...overrides,
});
