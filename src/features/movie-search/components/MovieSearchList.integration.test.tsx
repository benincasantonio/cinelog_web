import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MOVIE_ID, searchMovie } from '../models/movie-search.test-utils';
import { useMoviesStore } from '../stores/useMoviesStore';
import { MovieSearchList } from './MovieSearchList';

const { search, resolveMovie } = vi.hoisted(() => ({
	search: vi.fn(),
	resolveMovie: vi.fn(),
}));
vi.mock('../repositories/movies-repository', () => ({ search }));
vi.mock('@/features/movie/repositories/movies-repository', () => ({
	resolveMovie,
}));
vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

let intersect: IntersectionObserverCallback;
const unmapped = searchMovie({ id: null, movieRef: 'opaque' });
const mapped = searchMovie({ id: MOVIE_ID, movieRef: null }, 'Mapped film');
const renderSearch = () =>
	render(
		<MemoryRouter initialEntries={['/search']}>
			<Routes>
				<Route path="/search" element={<MovieSearchList />} />
				<Route
					path={`/movies/${MOVIE_ID}`}
					element={<h1>Canonical details</h1>}
				/>
			</Routes>
		</MemoryRouter>
	);

beforeEach(() => {
	vi.resetAllMocks();
	useMoviesStore.getState().resetMovieSearchResults();
	useMoviesStore.setState({
		searched: true,
		movieSearchResult: { results: [unmapped, mapped], nextCursor: null },
	});
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			constructor(callback: IntersectionObserverCallback) {
				intersect = callback;
			}
			observe = vi.fn();
			disconnect = vi.fn();
		}
	);
});
afterEach(() => vi.unstubAllGlobals());

it('supports keyboard selection and resolves exactly the selected reference', async () => {
	const user = userEvent.setup();
	resolveMovie.mockResolvedValue({ movieId: MOVIE_ID });
	renderSearch();
	expect(resolveMovie).not.toHaveBeenCalled();
	await user.tab();
	expect(screen.getByRole('button', { name: /Inception/ })).toHaveFocus();
	await user.keyboard('{Enter}');
	expect(await screen.findByText('Canonical details')).toBeInTheDocument();
	expect(resolveMovie).toHaveBeenCalledExactlyOnceWith('opaque');
});
it('opens a catalog movie without resolving', async () => {
	renderSearch();
	fireEvent.click(screen.getByRole('button', { name: /Mapped film/ }));
	expect(await screen.findByText('Canonical details')).toBeInTheDocument();
	expect(resolveMovie).not.toHaveBeenCalled();
});
it('keeps focus and suppresses duplicate activation while pending', async () => {
	resolveMovie.mockReturnValue(new Promise(() => undefined));
	renderSearch();
	const button = screen.getByRole('button', { name: /Inception/ });
	button.focus();
	fireEvent.click(button);
	fireEvent.click(button);
	expect(button).toHaveAttribute('aria-disabled', 'true');
	expect(button).toHaveFocus();
	expect(resolveMovie).toHaveBeenCalledTimes(1);
	expect(screen.getByRole('status')).toHaveTextContent(
		'MovieSelection.resolving'
	);
});
it('shows an inline failure and allows retry without losing results', async () => {
	resolveMovie
		.mockRejectedValueOnce(new Error('offline'))
		.mockResolvedValueOnce({ movieId: MOVIE_ID });
	renderSearch();
	fireEvent.click(screen.getByRole('button', { name: /Inception/ }));
	expect(await screen.findByRole('alert')).toHaveTextContent(
		'MovieSelection.temporary'
	);
	expect(screen.getByText('Mapped film')).toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: 'MovieSelection.retry' }));
	expect(await screen.findByText('Canonical details')).toBeInTheDocument();
});
it('invalidates resolution when the result list unmounts', async () => {
	let finish!: (result: { movieId: string }) => void;
	resolveMovie.mockReturnValue(
		new Promise((done) => {
			finish = done;
		})
	);
	const view = renderSearch();
	fireEvent.click(screen.getByRole('button', { name: /Inception/ }));
	view.unmount();
	await act(async () => finish({ movieId: MOVIE_ID }));
	expect(useMoviesStore.getState().resolvedMovieId).toBeNull();
});
it('loads an empty page on intersection and offers a keyboard fallback', async () => {
	useMoviesStore.setState({
		query: 'Inception',
		movieSearchResult: { results: [], nextCursor: 'next' },
	});
	search.mockResolvedValue({ results: [mapped], nextCursor: null });
	renderSearch();
	expect(
		screen.queryByText('MovieSearchList.noMoviesFound')
	).not.toBeInTheDocument();
	expect(
		screen.getByRole('button', { name: 'MovieSearchList.loadMore' })
	).toBeInTheDocument();
	await act(async () =>
		intersect(
			[{ isIntersecting: true } as IntersectionObserverEntry],
			{} as IntersectionObserver
		)
	);
	await waitFor(() => expect(search).toHaveBeenCalledWith('Inception', 'next'));
	expect(await screen.findByText('Mapped film')).toBeInTheDocument();
});
