import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HTTPError } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetLogs = vi.fn();
const mockUseMovieLogDialogStore = vi.fn();
const mockUseMovieRatingStore = vi.fn();

vi.mock('@/features/logs/repositories', () => ({
	getLogs: (...args: unknown[]) => mockGetLogs(...args),
}));

vi.mock('@/features/logs/stores', () => ({
	useMovieLogDialogStore: (
		selector: (state: { triggerCount: number }) => unknown
	) => selector(mockUseMovieLogDialogStore()),
}));

vi.mock('@/features/movie/stores/useMovieRatingStore', () => ({
	useMovieRatingStore: (
		selector: (state: { triggerCount: number }) => unknown
	) => selector(mockUseMovieRatingStore()),
}));

const mockT = (key: string) => key;
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: mockT,
	}),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Select: ({
		value,
		onValueChange,
		children,
	}: {
		value: string;
		onValueChange: (value: string) => void;
		children: React.ReactNode;
	}) => (
		<div data-testid="select" data-value={value}>
			<button
				type="button"
				data-testid="select-all"
				onClick={() => onValueChange('all')}
			>
				all
			</button>
			{children}
		</div>
	),
	SelectTrigger: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	SelectValue: ({ placeholder }: { placeholder?: string }) => (
		<span>{placeholder}</span>
	),
	SelectContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	SelectItem: ({
		children,
		value,
	}: {
		children: React.ReactNode;
		value: string;
	}) => <div data-testid={`select-item-${value}`}>{children}</div>,
}));

vi.mock('./MovieLogList', () => ({
	MovieLogList: ({
		logs,
	}: {
		logs: { id: string; movieRating?: number | null }[];
	}) => (
		<div data-testid="movie-log-list">
			{logs.map((log) => (
				<div
					key={log.id}
					data-testid={`log-${log.id}`}
					data-rating={log.movieRating ?? ''}
				>
					{log.id}
				</div>
			))}
		</div>
	),
}));

vi.mock('./MoviesWatchedLoading', () => ({
	MoviesWatchedLoading: () => <div data-testid="movies-watched-loading" />,
}));

let capturedOnSuccess:
	| ((movieRating: { tmdbId: string; rating: number }) => void)
	| undefined;

vi.mock('./RateMovieModal', () => ({
	RateMovieModal: ({
		onSuccess,
	}: {
		onSuccess?: (movieRating: { tmdbId: string; rating: number }) => void;
	}) => {
		capturedOnSuccess = onSuccess;
		return <div data-testid="rate-movie-modal" />;
	},
}));

import { MoviesWatched } from './MoviesWatched';

function createHttpError(errorCodeName: string) {
	const response = new Response(
		JSON.stringify({
			error_code_name: errorCodeName,
			error_code: 403,
			error_message: 'Forbidden',
			error_description: 'Profile is not public',
		}),
		{ status: 403 }
	);
	const request = new Request('http://localhost/v1/logs/test');
	return new HTTPError(response, request, {} as never);
}

describe('MoviesWatched', () => {
	const handle = 'neo';

	beforeEach(() => {
		vi.clearAllMocks();
		mockUseMovieLogDialogStore.mockReturnValue({ triggerCount: 0 });
		mockUseMovieRatingStore.mockReturnValue({ triggerCount: 0 });
	});

	it('renders loading first and then movies list', async () => {
		const currentYear = new Date().getFullYear();
		mockGetLogs.mockResolvedValueOnce({ logs: [{ id: '1' }] });

		render(<MoviesWatched handle={handle} />);

		expect(screen.getByTestId('movies-watched-loading')).toBeInTheDocument();

		await waitFor(() =>
			expect(screen.getByTestId('log-1')).toBeInTheDocument()
		);
		expect(mockGetLogs).toHaveBeenCalledWith(handle, {
			dateWatchedFrom: `${currentYear}-01-01`,
			dateWatchedTo: `${currentYear}-12-31`,
		});
	});

	it('fetches all years when year filter changes to all', async () => {
		const user = userEvent.setup();
		mockGetLogs.mockResolvedValue({ logs: [] });

		render(<MoviesWatched handle={handle} />);
		await waitFor(() =>
			expect(screen.getByTestId('movie-log-list')).toBeInTheDocument()
		);

		await user.click(screen.getByTestId('select-all'));

		await waitFor(() => expect(mockGetLogs).toHaveBeenCalledWith(handle, {}));
	});

	it('renders fallback translated error for unknown thrown values', async () => {
		mockGetLogs.mockRejectedValueOnce('unknown-error');

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByText('MoviesWatched.errorLoading')).toBeInTheDocument()
		);
	});

	it('renders Error message when request throws Error instance', async () => {
		mockGetLogs.mockRejectedValueOnce(new Error('network-failed'));

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByText('network-failed')).toBeInTheDocument()
		);
	});

	it('renders profile not public error when API returns PROFILE_NOT_PUBLIC', async () => {
		mockGetLogs.mockRejectedValueOnce(createHttpError('PROFILE_NOT_PUBLIC'));

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByText('ApiError.profileNotPublic')).toBeInTheDocument()
		);
	});
	it('renders RateMovieModal after logs load', async () => {
		mockGetLogs.mockResolvedValueOnce({ logs: [] });

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByTestId('rate-movie-modal')).toBeInTheDocument()
		);
	});

	it('updates matching log movieRating when rating succeeds', async () => {
		mockGetLogs.mockResolvedValueOnce({
			logs: [
				{ id: '1', tmdbId: 550, movieRating: 5 },
				{ id: '2', tmdbId: 278, movieRating: 7 },
			],
		});

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByTestId('log-1')).toBeInTheDocument()
		);

		// Simulate rating success via captured onSuccess
		act(() => {
			capturedOnSuccess?.({ tmdbId: '550', rating: 9 });
		});

		expect(screen.getByTestId('log-1')).toHaveAttribute('data-rating', '9');
		// Other log unchanged
		expect(screen.getByTestId('log-2')).toHaveAttribute('data-rating', '7');
	});

	it('does not update logs when rating tmdbId does not match any log', async () => {
		mockGetLogs.mockResolvedValueOnce({
			logs: [{ id: '1', tmdbId: 550, movieRating: 5 }],
		});

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByTestId('log-1')).toBeInTheDocument()
		);

		act(() => {
			capturedOnSuccess?.({ tmdbId: '999', rating: 10 });
		});

		expect(screen.getByTestId('log-1')).toHaveAttribute('data-rating', '5');
	});

	it('re-fetches logs when movieRatingRefreshCounter increments', async () => {
		mockGetLogs.mockResolvedValueOnce({
			logs: [{ id: '1', tmdbId: 550, movieRating: 5 }],
		});

		const { rerender } = render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByTestId('log-1')).toBeInTheDocument()
		);
		expect(mockGetLogs).toHaveBeenCalledTimes(1);

		// Simulate rating store triggerCount increment
		mockUseMovieRatingStore.mockReturnValue({ triggerCount: 1 });
		mockGetLogs.mockResolvedValueOnce({
			logs: [{ id: '1', tmdbId: 550, movieRating: 9 }],
		});

		rerender(<MoviesWatched handle={handle} />);

		await waitFor(() => expect(mockGetLogs).toHaveBeenCalledTimes(2));
		await waitFor(() =>
			expect(screen.getByTestId('log-1')).toHaveAttribute('data-rating', '9')
		);
	});

	it('sets movieRating on a log that previously had no rating', async () => {
		mockGetLogs.mockResolvedValueOnce({
			logs: [{ id: '1', tmdbId: 550, movieRating: null }],
		});

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByTestId('log-1')).toBeInTheDocument()
		);

		expect(screen.getByTestId('log-1')).toHaveAttribute('data-rating', '');

		act(() => {
			capturedOnSuccess?.({ tmdbId: '550', rating: 7 });
		});

		expect(screen.getByTestId('log-1')).toHaveAttribute('data-rating', '7');
	});

	it('updates all log entries for the same movie (rewatches)', async () => {
		mockGetLogs.mockResolvedValueOnce({
			logs: [
				{ id: '1', tmdbId: 550, movieRating: 5 },
				{ id: '2', tmdbId: 550, movieRating: 5 },
				{ id: '3', tmdbId: 278, movieRating: 6 },
			],
		});

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByTestId('log-1')).toBeInTheDocument()
		);

		act(() => {
			capturedOnSuccess?.({ tmdbId: '550', rating: 10 });
		});

		expect(screen.getByTestId('log-1')).toHaveAttribute('data-rating', '10');
		expect(screen.getByTestId('log-2')).toHaveAttribute('data-rating', '10');
		expect(screen.getByTestId('log-3')).toHaveAttribute('data-rating', '6');
	});
});
