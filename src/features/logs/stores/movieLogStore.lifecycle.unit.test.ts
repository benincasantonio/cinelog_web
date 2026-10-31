import { expect, it, vi } from 'vitest';
import { MOVIE_ID } from '@/features/movie-search/models/movie-search.test-utils';
import { useMovieLogStore } from './movieLogStore';

const { save } = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock('../repositories', () => ({
	createLog: save,
	updateLog: vi.fn(),
	deleteLog: vi.fn(),
}));
it('does not transfer an old write error or loading completion into a new dialog session', async () => {
	const log = { movieId: MOVIE_ID, dateWatched: '2026-10-31' };
	let fail!: (error: Error) => void;
	let finish!: (value: unknown) => void;
	save
		.mockReturnValueOnce(
			new Promise((_done, reject) => {
				fail = reject;
			})
		)
		.mockReturnValueOnce(
			new Promise((done) => {
				finish = done;
			})
		);
	const consoleSpy = vi
		.spyOn(console, 'error')
		.mockImplementation(() => undefined);
	const old = useMovieLogStore
		.getState()
		.createLog(log)
		.catch(() => undefined);
	useMovieLogStore.getState().reset();
	const current = useMovieLogStore.getState().createLog(log);
	fail(new Error('old failure'));
	await old;
	expect(useMovieLogStore.getState().error).toBeNull();
	expect(useMovieLogStore.getState().isLoading).toBe(true);
	finish({});
	await current;
	expect(useMovieLogStore.getState().isLoading).toBe(false);
	consoleSpy.mockRestore();
});
