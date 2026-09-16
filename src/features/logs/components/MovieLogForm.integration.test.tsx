import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MoviesWatched } from '@/features/movie/components/MoviesWatched';
import type { MovieRatingResponse } from '@/features/movie/models';
import { getMovieRating } from '@/features/movie/repositories/movie-rating-repository';
import type { LogListItem } from '../models';
import { createLog, getLogs, updateLog } from '../repositories';
import { useMovieLogDialogStore } from '../stores/movieLogDialogStore';
import { useMovieLogStore } from '../stores/movieLogStore';
import { CreateMovieLogDialog } from './MovieLogDialog';
import { MovieLogForm } from './MovieLogForm';

vi.mock('../repositories', () => ({
	getLogs: vi.fn(),
	createLog: vi.fn(),
	updateLog: vi.fn(),
	deleteLog: vi.fn(),
}));
vi.mock('@/features/movie/repositories/movie-rating-repository', () => ({
	getMovieRating: vi.fn(),
}));
vi.mock('@/features/movie-search/repositories', () => ({ search: vi.fn() }));
vi.mock('react-i18next', () => {
	const t = (key: string, params?: { value: number }) =>
		key === 'RateMovie.optionLabel' ? `Score ${params?.value}` : key;
	return { useTranslation: () => ({ t }) };
});
// Keep the real form, radio control, schema and stores; simplify only remote movie search.
vi.mock('@antoniobenincasa/ui', async (importOriginal) => ({
	...(await importOriginal<typeof import('@antoniobenincasa/ui')>()),
	Autocomplete: ({
		value,
		onValueChange,
		id,
	}: {
		value: string;
		id?: string;
		onValueChange: (value: string) => void;
	}) => (
		<select
			id={id}
			aria-label="MovieLogForm.movieLabel"
			value={value}
			onChange={(event) => onValueChange(event.target.value)}
		>
			<option value="">Choose</option>
			<option value="550">Fight Club</option>
			<option value="13">Forrest Gump</option>
		</select>
	),
}));

const savedRating = (rating: number) => ({ rating }) as MovieRatingResponse;
const editLog = {
	id: 'log-1',
	tmdbId: 550,
	dateWatched: '2026-09-13',
	movieRating: 8,
	movie: { title: 'Fight Club' },
} as LogListItem;
const score = (value: number) =>
	screen.getByRole('radio', { name: `Score ${value}` });
const submit = () =>
	fireEvent.submit(
		screen.getByText('MovieLogForm.dateWatchedLabel').closest('form')!
	);

beforeEach(() => {
	vi.resetAllMocks();
	useMovieLogDialogStore.setState({
		isOpen: true,
		movieToEdit: null,
		prefilledMovie: { tmdbId: 550, title: 'Fight Club' },
	});
	useMovieLogStore.setState({ isLoading: false, error: null });
	vi.mocked(getMovieRating).mockResolvedValue(savedRating(8));
	vi.mocked(createLog).mockResolvedValue({
		id: 'new-log',
		tmdbId: 550,
		movieId: 'movie',
		dateWatched: '2026-09-13',
		movieRating: null,
	});
	vi.mocked(updateLog).mockResolvedValue({
		...editLog,
		movieId: 'movie',
		movieRating: null,
	});
});

describe('movie-level rating in the log form', () => {
	it('prefills the saved rating and omits it when unchanged', async () => {
		render(<MovieLogForm />);
		await waitFor(() => expect(score(8)).toBeChecked());
		expect(getMovieRating).toHaveBeenCalledWith(550);
		submit();
		await waitFor(() => expect(createLog).toHaveBeenCalledOnce());
		expect(vi.mocked(createLog).mock.calls[0][0]).not.toHaveProperty('rating');
	});
	it('sends a changed rating in the same create request', async () => {
		render(<MovieLogForm />);
		await waitFor(() => expect(score(8)).toBeChecked());
		await userEvent.click(score(10));
		submit();
		await waitFor(() =>
			expect(createLog).toHaveBeenCalledWith(
				expect.objectContaining({ tmdbId: 550, rating: 10 })
			)
		);
	});
	it('prefills edit mode without a lookup and locks the movie', async () => {
		useMovieLogDialogStore.setState({
			movieToEdit: editLog,
			prefilledMovie: null,
		});
		render(<MovieLogForm />);
		expect(score(8)).toBeChecked();
		expect(getMovieRating).not.toHaveBeenCalled();
		expect(screen.getByLabelText('MovieLogForm.movieLabel')).toHaveAttribute(
			'readonly'
		);
		await userEvent.click(score(9));
		submit();
		await waitFor(() =>
			expect(updateLog).toHaveBeenCalledWith(
				'log-1',
				expect.objectContaining({ rating: 9 })
			)
		);
	});
	it('omits the edit rating after undoing a selection', async () => {
		useMovieLogDialogStore.setState({
			movieToEdit: editLog,
			prefilledMovie: null,
		});
		render(<MovieLogForm />);
		await userEvent.click(score(9));
		await userEvent.click(
			screen.getByRole('button', { name: 'MovieLogForm.resetRating' })
		);
		expect(score(8)).toBeChecked();
		submit();
		await waitFor(() => expect(updateLog).toHaveBeenCalledOnce());
		expect(vi.mocked(updateLog).mock.calls[0][1]).not.toHaveProperty('rating');
	});
	it('allows an unrated film to stay unrated after resetting a draft score', async () => {
		vi.mocked(getMovieRating).mockResolvedValue(undefined);
		render(<MovieLogForm />);
		await waitFor(() => expect(score(1)).toBeEnabled());
		expect(
			screen
				.getAllByRole('radio')
				.every((radio) => !(radio as HTMLInputElement).checked)
		).toBe(true);
		await userEvent.click(score(1));
		await userEvent.click(
			screen.getByRole('button', { name: 'MovieLogForm.resetRating' })
		);
		submit();
		await waitFor(() => expect(createLog).toHaveBeenCalledOnce());
		expect(vi.mocked(createLog).mock.calls[0][0]).not.toHaveProperty('rating');
	});
	it('shows a loading status but allows a log-only save', async () => {
		vi.mocked(getMovieRating).mockReturnValue(
			new Promise(() => {
				/* Keep the lookup pending for this test. */
			})
		);
		const { container } = render(<MovieLogForm />);
		expect(screen.getByRole('status')).toHaveTextContent(
			'MovieLogForm.ratingLoading'
		);
		expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
		expect(
			container.querySelectorAll('.movie-log-rating-skeleton-star')
		).toHaveLength(10);
		expect(screen.queryByRole('radio')).not.toBeInTheDocument();
		submit();
		await waitFor(() => expect(createLog).toHaveBeenCalledOnce());
		expect(vi.mocked(createLog).mock.calls[0][0]).not.toHaveProperty('rating');
	});
	it('allows a log-only save on lookup failure with the rating disabled', async () => {
		vi.mocked(getMovieRating).mockRejectedValueOnce(new Error('offline'));
		render(<MovieLogForm />);
		await waitFor(() =>
			expect(screen.getByRole('alert')).toHaveTextContent(
				'MovieLogForm.ratingLoadError'
			)
		);
		expect(score(8)).toBeDisabled();
		submit();
		await waitFor(() => expect(createLog).toHaveBeenCalledOnce());
		expect(vi.mocked(createLog).mock.calls[0][0]).not.toHaveProperty('rating');
	});
	it('retries the current movie and preserves other form fields', async () => {
		vi.mocked(getMovieRating).mockRejectedValueOnce(new Error('offline'));
		render(<MovieLogForm />);
		await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
		fireEvent.change(screen.getByLabelText('MovieLogForm.viewingNotesLabel'), {
			target: { value: 'Keep these notes' },
		});
		await userEvent.click(
			screen.getByRole('button', { name: 'MovieLogForm.retryRating' })
		);
		await waitFor(() => expect(score(8)).toBeChecked());
		expect(screen.getByLabelText('MovieLogForm.viewingNotesLabel')).toHaveValue(
			'Keep these notes'
		);
		expect(getMovieRating).toHaveBeenCalledTimes(2);
	});
	it('ignores older responses after switching movies', async () => {
		let resolveOld!: (value: MovieRatingResponse) => void;
		vi.mocked(getMovieRating)
			.mockReturnValueOnce(
				new Promise((resolve) => {
					resolveOld = resolve;
				})
			)
			.mockResolvedValueOnce(undefined);
		render(<MovieLogForm />);
		await userEvent.selectOptions(
			screen.getByLabelText('MovieLogForm.movieLabel'),
			'13'
		);
		await waitFor(() => expect(score(1)).toBeEnabled());
		await userEvent.click(score(4));
		await act(async () => {
			resolveOld(savedRating(8));
		});
		expect(score(4)).toBeChecked();
		submit();
		await waitFor(() =>
			expect(createLog).toHaveBeenCalledWith(
				expect.objectContaining({ tmdbId: 13, rating: 4 })
			)
		);
	});
	it('does not carry a selected rating to the next movie', async () => {
		render(<MovieLogForm />);
		await waitFor(() => expect(score(8)).toBeChecked());
		await userEvent.click(score(10));
		vi.mocked(getMovieRating).mockResolvedValue(undefined);
		await userEvent.selectOptions(
			screen.getByLabelText('MovieLogForm.movieLabel'),
			'13'
		);
		await waitFor(() => expect(score(10)).not.toBeChecked());
		submit();
		await waitFor(() => expect(createLog).toHaveBeenCalledOnce());
		expect(vi.mocked(createLog).mock.calls[0][0]).toMatchObject({ tmdbId: 13 });
		expect(vi.mocked(createLog).mock.calls[0][0]).not.toHaveProperty('rating');
	});
	it('keeps the form and selected score after a failed write', async () => {
		const consoleSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		vi.mocked(createLog).mockRejectedValueOnce(new Error('Save failed'));
		const onSuccess = vi.fn();
		try {
			render(<MovieLogForm onSuccess={onSuccess} />);
			await waitFor(() => expect(score(8)).toBeChecked());
			await userEvent.click(score(9));
			fireEvent.change(
				screen.getByLabelText('MovieLogForm.viewingNotesLabel'),
				{ target: { value: 'Keep' } }
			);
			submit();
			await screen.findByText('Save failed');
			expect(score(9)).toBeChecked();
			expect(
				screen.getByLabelText('MovieLogForm.viewingNotesLabel')
			).toHaveValue('Keep');
			expect(onSuccess).not.toHaveBeenCalled();
		} finally {
			consoleSpy.mockRestore();
		}
	});
	it('ignores lookup results from a closed form when reopened', async () => {
		let resolveOld!: (value: MovieRatingResponse) => void;
		vi.mocked(getMovieRating).mockReturnValueOnce(
			new Promise((resolve) => {
				resolveOld = resolve;
			})
		);
		const first = render(<MovieLogForm />);
		first.unmount();
		vi.mocked(getMovieRating).mockResolvedValue(undefined);
		render(<MovieLogForm />);
		await waitFor(() => expect(score(1)).toBeEnabled());
		await act(async () => {
			resolveOld(savedRating(8));
		});
		expect(score(8)).not.toBeChecked();
	});
});

it('refreshes every viewing of the same movie after saving from the dialog', async () => {
	useMovieLogDialogStore.setState({
		isOpen: false,
		movieToEdit: null,
		prefilledMovie: null,
	});
	const logs = [editLog, { ...editLog, id: 'log-2' }];
	vi.mocked(getLogs)
		.mockResolvedValueOnce({ logs })
		.mockResolvedValue({
			logs: logs.map((log) => ({ ...log, movieRating: 9 })),
		});
	render(
		<MemoryRouter>
			<MoviesWatched handle="owner" />
			<CreateMovieLogDialog />
		</MemoryRouter>
	);
	await waitFor(() => expect(screen.getAllByText('8.0')).toHaveLength(2));
	act(() => useMovieLogDialogStore.getState().open({ movieToEdit: editLog }));
	await userEvent.click(score(9));
	await userEvent.click(
		screen.getByRole('button', { name: 'CreateMovieLogDialog.submitUpdate' })
	);
	await waitFor(() =>
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	);
	await waitFor(() => expect(screen.getAllByText('9.0')).toHaveLength(2));
	expect(updateLog).toHaveBeenCalledOnce();
	expect(getLogs).toHaveBeenCalledTimes(2);
});
