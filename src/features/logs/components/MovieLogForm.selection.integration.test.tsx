import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import { HTTPError } from 'ky';
import { beforeEach, expect, it, vi } from 'vitest';
import {
	MOVIE_ID,
	OTHER_MOVIE_ID,
	searchMovie,
} from '@/features/movie-search/models/movie-search.test-utils';
import { useMovieLogDialogStore } from '../stores/movieLogDialogStore';
import { useMovieLogStore } from '../stores/movieLogStore';
import { MovieLogForm } from './MovieLogForm';

const { search, resolveMovie, save, rating } = vi.hoisted(() => ({
	search: vi.fn(),
	resolveMovie: vi.fn(),
	save: vi.fn(),
	rating: vi.fn(),
}));
vi.mock('@/features/movie-search/repositories', () => ({ search }));
vi.mock('@/features/movie/repositories/movies-repository', () => ({
	resolveMovie,
}));
vi.mock('@/features/movie/repositories/movie-rating-repository', () => ({
	getMovieRating: rating,
}));
vi.mock('../repositories', () => ({
	createLog: save,
	updateLog: vi.fn(),
	deleteLog: vi.fn(),
}));
vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@antoniobenincasa/ui', async (original) => ({
	...(await original<typeof import('@antoniobenincasa/ui')>()),
	Autocomplete: ({
		value,
		items,
		onFilterChange,
		onValueChange,
	}: {
		value: string;
		items: Array<{ value: string; label: string }>;
		onFilterChange: (query: string) => void;
		onValueChange: (value: string) => void;
	}) => (
		<div>
			<input
				aria-label="Search movies"
				onChange={(event) => onFilterChange(event.target.value)}
			/>
			<select
				aria-label="Choose movie"
				value={value}
				onChange={(event) => onValueChange(event.target.value)}
			>
				<option value="">Choose</option>
				{items.map((item) => (
					<option key={item.value} value={item.value}>
						{item.label}
					</option>
				))}
			</select>
		</div>
	),
}));
const fillAndSelect = async () => {
	fireEvent.change(screen.getByLabelText('MovieLogForm.dateWatchedLabel'), {
		target: { value: '2026-10-31' },
	});
	fireEvent.change(screen.getByLabelText('MovieLogForm.viewingNotesLabel'), {
		target: { value: 'Keep my notes' },
	});
	fireEvent.change(screen.getByLabelText('Search movies'), {
		target: { value: 'film' },
	});
	await screen.findByRole('option', { name: 'A' });
	fireEvent.change(screen.getByLabelText('Choose movie'), {
		target: { value: 'ref-a' },
	});
};
beforeEach(() => {
	vi.resetAllMocks();
	useMovieLogDialogStore.getState().open();
	useMovieLogStore.getState().reset();
	search.mockResolvedValue({
		results: [
			searchMovie({ id: null, movieRef: 'ref-a' }, 'A'),
			searchMovie({ id: OTHER_MOVIE_ID, movieRef: null }, 'B'),
		],
		nextCursor: null,
	});
	rating.mockResolvedValue(undefined);
	save.mockResolvedValue({ movieId: MOVIE_ID });
});
it('blocks unresolved writes, preserves input on failure and submits exact canonical JSON after retry', async () => {
	resolveMovie
		.mockRejectedValueOnce(new Error('offline'))
		.mockResolvedValueOnce({ movieId: MOVIE_ID });
	render(<MovieLogForm />);
	await fillAndSelect();
	await screen.findByRole('alert');
	expect(
		screen.getByRole('button', { name: 'MovieLogForm.submitCreate' })
	).toBeDisabled();
	fireEvent.submit(
		screen.getByLabelText('MovieLogForm.dateWatchedLabel').closest('form')!
	);
	expect(save).not.toHaveBeenCalled();
	expect(screen.getByLabelText('MovieLogForm.viewingNotesLabel')).toHaveValue(
		'Keep my notes'
	);
	fireEvent.click(screen.getByRole('button', { name: 'MovieSelection.retry' }));
	await waitFor(() =>
		expect(
			screen.getByRole('button', { name: 'MovieLogForm.submitCreate' })
		).toBeEnabled()
	);
	fireEvent.click(
		screen.getByRole('button', { name: 'MovieLogForm.submitCreate' })
	);
	await waitFor(() =>
		expect(save).toHaveBeenCalledWith({
			movieId: MOVIE_ID,
			dateWatched: '2026-10-31',
			viewingNotes: 'Keep my notes',
			watchedWhere: undefined,
		})
	);
});
it('invalidates history after a late successful save without closing or resetting a newer form', async () => {
	let finish!: (value: unknown) => void;
	save.mockReturnValue(
		new Promise((done) => {
			finish = done;
		})
	);
	useMovieLogDialogStore
		.getState()
		.open({ prefilledMovie: { movieId: MOVIE_ID, title: 'A' } });
	const onSuccess = vi.fn();
	const view = render(<MovieLogForm onSuccess={onSuccess} />);
	fireEvent.submit(
		screen.getByLabelText('MovieLogForm.dateWatchedLabel').closest('form')!
	);
	await waitFor(() => expect(save).toHaveBeenCalledOnce());
	view.unmount();
	useMovieLogDialogStore
		.getState()
		.open({ prefilledMovie: { movieId: OTHER_MOVIE_ID, title: 'B' } });
	const count = useMovieLogDialogStore.getState().triggerCount;
	await act(async () => finish({ movieId: MOVIE_ID }));
	expect(onSuccess).not.toHaveBeenCalled();
	expect(useMovieLogDialogStore.getState().prefilledMovie?.movieId).toBe(
		OTHER_MOVIE_ID
	);
	expect(useMovieLogDialogStore.getState().triggerCount).toBe(count + 1);
});

it.each([
	['INVALID_MOVIE_REF', 'invalidReference'],
	['PROVIDER_MOVIE_NOT_FOUND', 'unavailable'],
])('offers the appropriate recovery for %s without losing form input', async (code, message) => {
	resolveMovie.mockRejectedValueOnce(
		new HTTPError(
			new Response(JSON.stringify({ error_code_name: code }), { status: 422 }),
			new Request('http://localhost/resolve'),
			{} as never
		)
	);
	render(<MovieLogForm />);
	await fillAndSelect();
	expect(await screen.findByRole('alert')).toHaveTextContent(
		`MovieSelection.${message}`
	);
	expect(
		screen.getByRole('button', { name: 'MovieLogForm.submitCreate' })
	).toBeDisabled();
	expect(screen.getByLabelText('MovieLogForm.viewingNotesLabel')).toHaveValue(
		'Keep my notes'
	);
	expect(
		screen.queryByRole('button', { name: 'MovieSelection.retry' })
	).not.toBeInTheDocument();
	if (code === 'INVALID_MOVIE_REF') {
		fireEvent.click(
			screen.getByRole('button', { name: 'MovieSelection.searchAgain' })
		);
		await waitFor(() => expect(search).toHaveBeenCalledTimes(2));
		expect(screen.getByLabelText('Choose movie')).toHaveValue('');
		expect(resolveMovie).toHaveBeenCalledOnce();
	}
});
