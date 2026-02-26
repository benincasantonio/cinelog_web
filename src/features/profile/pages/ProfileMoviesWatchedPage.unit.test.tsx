import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@/features/movie/components/MoviesWatched', () => ({
	MoviesWatched: () => <div data-testid="movies-watched">Movies Watched</div>,
}));

import ProfileMoviesWatchedPage from './ProfileMoviesWatchedPage';

describe('ProfileMoviesWatchedPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render the page title', () => {
		render(<ProfileMoviesWatchedPage />);

		const titleElement = document.querySelector('title');
		expect(titleElement).toBeInTheDocument();
		expect(titleElement?.textContent).toBe(
			'ProfileMoviesWatchedPage.pageTitle'
		);
	});

	it('should render the MoviesWatched component', () => {
		render(<ProfileMoviesWatchedPage />);

		expect(screen.getByTestId('movies-watched')).toBeInTheDocument();
	});
});
