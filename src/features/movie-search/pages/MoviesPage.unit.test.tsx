import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('../components', () => ({
	MovieSearchList: () => <div data-testid="movie-search-list">Search List</div>,
}));

import MoviesPage from './MoviesPage';

describe('MoviesPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render the heading', () => {
		render(<MoviesPage />);

		expect(screen.getByText('MoviesPage.title')).toBeInTheDocument();
	});

	it('should render the search input', () => {
		render(<MoviesPage />);

		expect(
			screen.getByPlaceholderText('MovieSearchPage.searchPlaceholder')
		).toBeInTheDocument();
	});

	it('should render the MovieSearchList', () => {
		render(<MoviesPage />);

		expect(screen.getByTestId('movie-search-list')).toBeInTheDocument();
	});
});
