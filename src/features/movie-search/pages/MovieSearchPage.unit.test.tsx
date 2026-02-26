import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const mockLoadMovieSearchResults = vi.fn();
const mockResetMovieSearchResults = vi.fn();
vi.mock('../stores', () => ({
	useMoviesStore: (selector: (state: unknown) => unknown) =>
		selector({
			loadMovieSearchResults: mockLoadMovieSearchResults,
			resetMovieSearchResults: mockResetMovieSearchResults,
		}),
}));

vi.mock('../components', () => ({
	MovieSearchList: () => <div data-testid="movie-search-list">Search List</div>,
}));

import MovieSearchPage from './MovieSearchPage';

describe('MovieSearchPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should render the page title', () => {
		render(<MovieSearchPage />);

		const titleElement = document.querySelector('title');
		expect(titleElement).toBeInTheDocument();
		expect(titleElement?.textContent).toBe('MovieSearchPage.pageTitle');
	});

	it('should render the heading', () => {
		render(<MovieSearchPage />);

		expect(screen.getByText('MovieSearchPage.title')).toBeInTheDocument();
	});

	it('should render the search input', () => {
		render(<MovieSearchPage />);

		expect(
			screen.getByPlaceholderText('MovieSearchPage.searchPlaceholder')
		).toBeInTheDocument();
	});

	it('should render the MovieSearchList', () => {
		render(<MovieSearchPage />);

		expect(screen.getByTestId('movie-search-list')).toBeInTheDocument();
	});

	it('should reset results on mount', () => {
		render(<MovieSearchPage />);

		expect(mockResetMovieSearchResults).toHaveBeenCalled();
	});

	it('should reset results when query is less than 3 characters', () => {
		render(<MovieSearchPage />);
		mockResetMovieSearchResults.mockClear();

		const input = screen.getByPlaceholderText(
			'MovieSearchPage.searchPlaceholder'
		);
		fireEvent.change(input, { target: { value: 'ab' } });

		expect(mockResetMovieSearchResults).toHaveBeenCalled();
		expect(mockLoadMovieSearchResults).not.toHaveBeenCalled();
	});

	it('should debounce and search when query is 3+ characters', () => {
		render(<MovieSearchPage />);

		const input = screen.getByPlaceholderText(
			'MovieSearchPage.searchPlaceholder'
		);
		fireEvent.change(input, { target: { value: 'Inception' } });

		// Should not search immediately
		expect(mockLoadMovieSearchResults).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(500);
		});

		expect(mockLoadMovieSearchResults).toHaveBeenCalledWith('Inception');
	});

	it('should clear previous timeout on new input', () => {
		render(<MovieSearchPage />);

		const input = screen.getByPlaceholderText(
			'MovieSearchPage.searchPlaceholder'
		);

		fireEvent.change(input, { target: { value: 'Ince' } });

		act(() => {
			vi.advanceTimersByTime(300);
		});

		// Type more before debounce fires
		fireEvent.change(input, { target: { value: 'Inception' } });

		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Should only have searched for the final value
		expect(mockLoadMovieSearchResults).toHaveBeenCalledTimes(1);
		expect(mockLoadMovieSearchResults).toHaveBeenCalledWith('Inception');
	});
});
