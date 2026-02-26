import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: { count?: number }) =>
			typeof options?.count === 'number' ? `${key}:${options.count}` : key,
	}),
}));

vi.mock('./MovieLogItem', () => ({
	MovieLogItem: ({ log }: { log: { id: string } }) => (
		<div data-testid="movie-log-item">{log.id}</div>
	),
}));

import { MovieLogList } from './MovieLogList';

describe('MovieLogList', () => {
	it('renders empty state when no logs exist', () => {
		render(<MovieLogList logs={[]} />);
		expect(screen.getByText('MovieLogList.noMovies')).toBeInTheDocument();
	});

	it('renders count and log items when logs exist', () => {
		render(
			<MovieLogList
				logs={
					[
						{ id: '1', dateWatched: '2024-01-01', tmdbId: 1 },
						{ id: '2', dateWatched: '2024-01-02', tmdbId: 2 },
					] as never
				}
			/>
		);

		expect(screen.getByText('MovieLogList.watchedMovie:2')).toBeInTheDocument();
		expect(screen.getAllByTestId('movie-log-item')).toHaveLength(2);
	});
});
