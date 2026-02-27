import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

const movieDetailsState = {
	movieDetails: undefined as
		| {
				title: string;
				posterPath: string | null;
				backdropPath: string | null;
				releaseDate: string;
				runtime: number;
				voteAverage: number;
				overview: string;
				genres: { id: number; name: string }[];
				tagline: string | null;
		  }
		| undefined,
	movieRating: undefined as { rating: number } | undefined,
	isLoading: false,
	isMovieRatingLoading: false,
	loadMovieDetails: vi.fn(),
	loadMovieRating: vi.fn(),
	resetMovieDetails: vi.fn(),
	setMovieRating: vi.fn(),
};

const movieRatingState = {
	openModal: vi.fn(),
};

const movieLogDialogState = {
	open: vi.fn(),
};

vi.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
	useParams: () => mockUseParams(),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Skeleton: ({ className }: { className?: string }) => (
		<div data-testid="skeleton" className={className} />
	),
}));

vi.mock('@/features/logs/stores', () => ({
	useMovieLogDialogStore: (
		selector: (state: typeof movieLogDialogState) => unknown
	) => selector(movieLogDialogState),
}));

vi.mock('../stores/useMovieRatingStore', () => ({
	useMovieRatingStore: (
		selector: (state: typeof movieRatingState) => unknown
	) => selector(movieRatingState),
}));

vi.mock('../stores/useMovieDetailsStore', () => ({
	useMovieDetailsStore: (
		selector: (state: typeof movieDetailsState) => unknown
	) => selector(movieDetailsState),
}));

vi.mock('../components/MovieDetailsHero', () => ({
	MovieDetailsHero: ({ title }: { title: string }) => (
		<div data-testid="movie-details-hero">{title}</div>
	),
}));

vi.mock('../components/MovieRuntime', () => ({
	MovieRuntime: ({ runtime }: { runtime: number }) => (
		<div data-testid="movie-runtime">{runtime}</div>
	),
}));

vi.mock('../components/MovieGenres', () => ({
	MovieGenres: ({ genres }: { genres: { id: number; name: string }[] }) => (
		<div data-testid="movie-genres">{genres.length}</div>
	),
}));

vi.mock('../components/MovieVote', () => ({
	MovieVote: ({
		vote,
		source,
		onClick,
	}: {
		vote: number;
		source: string;
		onClick?: () => void;
	}) => (
		<button
			type="button"
			data-testid={`movie-vote-${source}`}
			onClick={onClick}
		>
			{vote}
		</button>
	),
}));

vi.mock('../components/RateMovieModal', () => ({
	RateMovieModal: ({
		onSuccess,
	}: {
		onSuccess: (rating: { rating: number }) => void;
	}) => (
		<button
			type="button"
			data-testid="rate-modal-success"
			onClick={() => onSuccess({ rating: 9 })}
		>
			success
		</button>
	),
}));

import MovieDetailsPage from './MovieDetailsPage';

describe('MovieDetailsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseParams.mockReturnValue({ tmdbId: '10' });
		movieDetailsState.movieDetails = undefined;
		movieDetailsState.movieRating = undefined;
		movieDetailsState.isLoading = false;
		movieDetailsState.isMovieRatingLoading = false;
	});

	it('renders loading state', () => {
		movieDetailsState.isLoading = true;

		render(<MovieDetailsPage />);

		expect(screen.getByText('MovieDetailsPage.loading')).toBeInTheDocument();
		expect(movieDetailsState.loadMovieDetails).toHaveBeenCalledWith(10);
		expect(movieDetailsState.loadMovieRating).toHaveBeenCalledWith(10);
	});

	it('renders not-found state and go-back action', () => {
		render(<MovieDetailsPage />);

		expect(screen.getByText('MovieDetailsPage.notFound')).toBeInTheDocument();
		fireEvent.click(screen.getByText('MovieDetailsPage.goBack'));
		expect(mockNavigate).toHaveBeenCalledWith(-1);
	});

	it('renders details and actions for rating/logging movie', async () => {
		movieDetailsState.movieDetails = {
			title: 'Inception',
			posterPath: '/p.jpg',
			backdropPath: '/b.jpg',
			releaseDate: '2010-07-16',
			runtime: 148,
			voteAverage: 8.8,
			overview: '',
			genres: [{ id: 1, name: 'Sci-Fi' }],
			tagline: 'Dream within a dream',
		};

		render(<MovieDetailsPage />);

		expect(screen.getByTestId('movie-details-hero')).toHaveTextContent(
			'Inception'
		);
		expect(screen.getByText('MovieDetailsPage.noOverview')).toBeInTheDocument();
		fireEvent.click(screen.getByText('MovieDetailsPage.rate'));
		expect(movieRatingState.openModal).toHaveBeenCalledWith('10');

		fireEvent.click(screen.getByText('MovieDetailsPage.logMovie'));
		expect(movieLogDialogState.open).toHaveBeenCalledWith({
			prefilledMovie: { tmdbId: 10, title: 'Inception' },
		});

		fireEvent.click(screen.getByTestId('rate-modal-success'));
		await waitFor(() =>
			expect(movieDetailsState.setMovieRating).toHaveBeenCalledWith({
				rating: 9,
			})
		);
	});

	it('renders user rating path and opens edit modal from vote click', () => {
		movieDetailsState.movieDetails = {
			title: 'Interstellar',
			posterPath: '/p.jpg',
			backdropPath: '/b.jpg',
			releaseDate: '2014-11-07',
			runtime: 169,
			voteAverage: 8.6,
			overview: 'Space.',
			genres: [{ id: 1, name: 'Sci-Fi' }],
			tagline: null,
		};
		movieDetailsState.movieRating = { rating: 7 };

		render(<MovieDetailsPage />);

		fireEvent.click(screen.getByTestId('movie-vote-user'));
		expect(movieRatingState.openModal).toHaveBeenCalledWith('10', {
			rating: 7,
		});
	});

	it('handles missing tmdbId and rating loading branch', () => {
		mockUseParams.mockReturnValue({});
		movieDetailsState.movieDetails = {
			title: 'No Id',
			posterPath: '/p.jpg',
			backdropPath: '/b.jpg',
			releaseDate: '2020-01-01',
			runtime: 90,
			voteAverage: 7,
			overview: 'Overview',
			genres: [{ id: 1, name: 'Drama' }],
			tagline: null,
		};
		movieDetailsState.isMovieRatingLoading = true;
		movieDetailsState.movieRating = { rating: 0 };

		render(<MovieDetailsPage />);

		expect(movieDetailsState.loadMovieDetails).not.toHaveBeenCalled();
		expect(screen.getByTestId('skeleton')).toBeInTheDocument();
		fireEvent.click(screen.getByTestId('rate-modal-success'));
		expect(movieDetailsState.setMovieRating).not.toHaveBeenCalled();
	});

	it('renders user vote with zero rating fallback', () => {
		movieDetailsState.movieDetails = {
			title: 'Zero Vote',
			posterPath: '/p.jpg',
			backdropPath: '/b.jpg',
			releaseDate: '2022-01-01',
			runtime: 100,
			voteAverage: 5,
			overview: 'overview',
			genres: [{ id: 1, name: 'Drama' }],
			tagline: null,
		};
		movieDetailsState.movieRating = { rating: 0 };
		movieDetailsState.isMovieRatingLoading = false;

		render(<MovieDetailsPage />);

		expect(screen.getByTestId('movie-vote-user')).toHaveTextContent('0');
	});
});
