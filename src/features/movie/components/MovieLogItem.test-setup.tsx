import { BrowserRouter, useParams } from 'react-router-dom';
import type { LogListItem } from '@/features/logs/models';
import { MovieLogItem } from './MovieLogItem';

// Create a test component that wraps MovieLogItem with routing
export const TestWrapper = ({ log }: { log: LogListItem }) => {
	return (
		<BrowserRouter>
			<MovieLogItem log={log} />
			<NavigationTracker />
		</BrowserRouter>
	);
};

// Component to track navigation
const NavigationTracker = () => {
	const params = useParams();
	return <div data-testid="nav-tracker">{JSON.stringify(params)}</div>;
};

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
