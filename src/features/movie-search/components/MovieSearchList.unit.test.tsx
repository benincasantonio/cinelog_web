import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockMoviesStore } = vi.hoisted(() => {
	// biome-ignore lint/style/noCommonJs: require is needed inside vi.hoisted
	const { create } = require('zustand');

	const mockMoviesStore = create(() => ({
		movieSearchResult: null,
		isLoading: false,
		searched: false,
	}));

	return { mockMoviesStore };
});

vi.mock('../stores/useMoviesStore', () => ({
	useMoviesStore: (selector: (state: unknown) => unknown) =>
		selector(mockMoviesStore.getState()),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
}));

import { MovieSearchList } from './MovieSearchList';

describe('MovieSearchList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockMoviesStore.setState({
			movieSearchResult: null,
			isLoading: false,
			searched: false,
		});
	});

	it('should show loading state', () => {
		mockMoviesStore.setState({ isLoading: true });

		render(<MovieSearchList />);

		expect(screen.getByText('MovieSearchList.searching')).toBeInTheDocument();
	});

	it('should show start typing message when not yet searched', () => {
		render(<MovieSearchList />);

		expect(screen.getByText('MovieSearchList.startTyping')).toBeInTheDocument();
	});

	it('should show no results message when search returns empty', () => {
		mockMoviesStore.setState({
			searched: true,
			movieSearchResult: { results: [] },
		});

		render(<MovieSearchList />);

		expect(
			screen.getByText('MovieSearchList.noMoviesFound')
		).toBeInTheDocument();
	});

	it('should show no results message when movieSearchResult is null after search', () => {
		mockMoviesStore.setState({
			searched: true,
			movieSearchResult: null,
		});

		render(<MovieSearchList />);

		expect(
			screen.getByText('MovieSearchList.noMoviesFound')
		).toBeInTheDocument();
	});

	it('should render movie results', () => {
		mockMoviesStore.setState({
			searched: true,
			movieSearchResult: {
				results: [
					{
						id: 1,
						title: 'Inception',
						releaseDate: '2010-07-16',
						voteAverage: 8.4,
						posterPath: '/poster.jpg',
					},
				],
			},
		});

		render(<MovieSearchList />);

		expect(screen.getByText('MovieSearchList.topResults')).toBeInTheDocument();
		expect(screen.getByText('Inception')).toBeInTheDocument();
		expect(screen.getByText('2010')).toBeInTheDocument();
		expect(screen.getByText('★ 8.4')).toBeInTheDocument();
	});

	it('should navigate to movie details on click', async () => {
		const user = userEvent.setup();
		mockMoviesStore.setState({
			searched: true,
			movieSearchResult: {
				results: [
					{
						id: 42,
						title: 'The Matrix',
						releaseDate: '1999-03-31',
						voteAverage: 8.7,
						posterPath: '/matrix.jpg',
					},
				],
			},
		});

		render(<MovieSearchList />);

		await user.click(screen.getByText('The Matrix'));

		expect(mockNavigate).toHaveBeenCalledWith('/movies/42');
	});

	it('should show N/A when releaseDate is missing', () => {
		mockMoviesStore.setState({
			searched: true,
			movieSearchResult: {
				results: [
					{
						id: 1,
						title: 'Unknown Movie',
						releaseDate: null,
						voteAverage: 0,
						posterPath: null,
					},
				],
			},
		});

		render(<MovieSearchList />);

		expect(screen.getByText('N/A')).toBeInTheDocument();
	});

	it('should not show vote when voteAverage is 0', () => {
		mockMoviesStore.setState({
			searched: true,
			movieSearchResult: {
				results: [
					{
						id: 1,
						title: 'No Votes',
						releaseDate: '2024-01-01',
						voteAverage: 0,
						posterPath: null,
					},
				],
			},
		});

		render(<MovieSearchList />);

		expect(screen.queryByText(/★/)).not.toBeInTheDocument();
	});

	it('should show no-image placeholder when posterPath is missing', () => {
		mockMoviesStore.setState({
			searched: true,
			movieSearchResult: {
				results: [
					{
						id: 1,
						title: 'No Poster',
						releaseDate: '2024-01-01',
						voteAverage: 5.0,
						posterPath: null,
					},
				],
			},
		});

		render(<MovieSearchList />);

		expect(screen.getByText('MovieLogItem.noImage')).toBeInTheDocument();
	});

	it('should not show no-image placeholder when posterPath exists', () => {
		mockMoviesStore.setState({
			searched: true,
			movieSearchResult: {
				results: [
					{
						id: 1,
						title: 'Has Poster',
						releaseDate: '2024-01-01',
						voteAverage: 5.0,
						posterPath: '/poster.jpg',
					},
				],
			},
		});

		render(<MovieSearchList />);

		expect(screen.queryByText('MovieLogItem.noImage')).not.toBeInTheDocument();
	});
});
