import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { changeActiveLocale } from '@/lib/locales/i18n';
import type { TMDBMovieSearchResultItem } from '../models';
import { MovieSearchList } from './MovieSearchList';

const movie: TMDBMovieSearchResultItem = {
	id: 42,
	title: 'The Matrix',
	releaseDate: '1999-03-31',
	voteAverage: 8.7,
	posterPath: '/matrix.jpg',
	overview: '',
	backdropPath: null,
	genreIds: [],
	originalLanguage: 'en',
	originalTitle: 'The Matrix',
};

const renderList = (
	props: Partial<ComponentProps<typeof MovieSearchList>> = {}
) =>
	render(
		<MemoryRouter>
			<Routes>
				<Route
					path="/"
					element={
						<MovieSearchList
							isLoading={false}
							isFetching={false}
							isError={false}
							onRetry={vi.fn()}
							{...props}
						/>
					}
				/>
				<Route path="/movies/42" element={<p>Movie details</p>} />
			</Routes>
		</MemoryRouter>
	);

describe('MovieSearchList', () => {
	beforeEach(async () => {
		await changeActiveLocale('en-US');
	});

	it('shows the initial prompt', () => {
		renderList();
		expect(
			screen.getByText('Start typing to search for movies.')
		).toBeInTheDocument();
	});

	it('shows loading before results arrive', () => {
		renderList({ isLoading: true, isFetching: true });
		expect(screen.getByText('Searching for movies...')).toBeInTheDocument();
	});

	it('shows an empty result', () => {
		renderList({ results: [] });
		expect(
			screen.getByText('No movies found. Try searching for something!')
		).toBeInTheDocument();
	});

	it('renders the title, year, rating and poster', () => {
		renderList({ results: [movie] });
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
		expect(screen.getByText('1999')).toBeInTheDocument();
		expect(screen.getByText('★ 8.7')).toBeInTheDocument();
		expect(screen.queryByText('No Image')).not.toBeInTheDocument();
	});

	it('navigates to the selected movie', async () => {
		renderList({ results: [movie] });
		await userEvent.click(screen.getByText('The Matrix'));
		expect(screen.getByText('Movie details')).toBeInTheDocument();
	});

	it('handles missing images and dates and omits zero ratings', () => {
		renderList({
			results: [
				{ ...movie, posterPath: null, releaseDate: '', voteAverage: 0 },
			],
		});
		expect(screen.getByText('N/A')).toBeInTheDocument();
		expect(screen.getByText(/no image/i)).toBeInTheDocument();
		expect(screen.queryByText(/★/)).not.toBeInTheDocument();
	});

	it('keeps cached results visible during background refresh', () => {
		renderList({ results: [movie], isFetching: true });
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
		expect(
			screen.queryByText('Searching for movies...')
		).not.toBeInTheDocument();
	});

	it('shows an accessible failure with a working retry action', async () => {
		const onRetry = vi.fn();
		renderList({ isError: true, onRetry });
		expect(screen.getByRole('alert')).toHaveTextContent(
			'Unable to search movies. Please try again.'
		);
		expect(
			screen.queryByText('No movies found. Try searching for something!')
		).not.toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
		expect(onRetry).toHaveBeenCalledOnce();
	});

	it('retains cached results on failure and disables Retry during refresh', () => {
		renderList({ results: [movie], isError: true, isFetching: true });
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Retry' })).toBeDisabled();
	});

	it.each([
		['it-IT', 'Impossibile cercare i film. Riprova.', 'Riprova'],
		[
			'fr-FR',
			'Impossible de rechercher des films. Veuillez réessayer.',
			'Réessayer',
		],
	] as const)('translates errors and Retry into %s', async (locale, error, retry) => {
		await changeActiveLocale(locale);
		renderList({ isError: true });
		expect(screen.getByRole('alert')).toHaveTextContent(error);
		expect(screen.getByRole('button', { name: retry })).toBeInTheDocument();
	});
});
