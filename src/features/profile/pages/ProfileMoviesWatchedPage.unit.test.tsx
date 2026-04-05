import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@/features/movie/components/MoviesWatched', () => ({
	MoviesWatched: ({ handle }: { handle: string }) => (
		<div data-testid="movies-watched">{handle}</div>
	),
}));

import ProfileMoviesWatchedPage from './ProfileMoviesWatchedPage';

function renderWithRouter(handle: string) {
	return render(
		<MemoryRouter initialEntries={[`/profile/${handle}/movie-watched`]}>
			<Routes>
				<Route
					path="/profile/:handle/movie-watched"
					element={<ProfileMoviesWatchedPage />}
				/>
			</Routes>
		</MemoryRouter>
	);
}

describe('ProfileMoviesWatchedPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render the page title', () => {
		renderWithRouter('neo');

		const titleElement = document.querySelector('title');
		expect(titleElement).toBeInTheDocument();
		expect(titleElement?.textContent).toBe(
			'ProfileMoviesWatchedPage.pageTitle'
		);
	});

	it('should render the MoviesWatched component with handle', () => {
		renderWithRouter('neo');

		expect(screen.getByTestId('movies-watched')).toBeInTheDocument();
		expect(screen.getByTestId('movies-watched')).toHaveTextContent('neo');
	});
});
