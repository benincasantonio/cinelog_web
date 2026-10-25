import { QueryClientProvider } from '@tanstack/react-query';
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { useAuthStore } from '@/features/auth/stores';
import { createQueryClient } from '@/lib/api/query-client';
import { changeActiveLocale } from '@/lib/locales/i18n';
import type { TMDBMovieSearchResult } from '../models';
import MovieSearchPage from './MovieSearchPage';

vi.hoisted(() => vi.stubEnv('VITE_API_URL', 'https://api.example.test/'));
afterAll(() => vi.unstubAllEnvs());

const response = (title: string) =>
	Response.json({
		page: 1,
		totalPages: 1,
		totalResults: 1,
		results: [
			{
				id: 42,
				title,
				releaseDate: '1999-03-31',
				voteAverage: 8.7,
				posterPath: null,
				overview: '',
				backdropPath: null,
				genreIds: [],
				originalLanguage: 'en',
				originalTitle: title,
			},
		],
	} satisfies TMDBMovieSearchResult);

describe('movie search with the real query and HTTP layers', () => {
	let client: ReturnType<typeof createQueryClient>;
	const fetchMock = vi.fn<typeof fetch>();
	const type = (value: string) =>
		fireEvent.change(screen.getByRole('textbox'), { target: { value } });
	const advance = async (ms = 500) => {
		await act(async () => {
			await vi.advanceTimersByTimeAsync(ms);
		});
		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});
	};
	const request = (index: number) => fetchMock.mock.calls[index][0] as Request;

	beforeEach(async () => {
		await changeActiveLocale('en-US');
		useAuthStore.setState({ authenticatedStatus: true });
		client = createQueryClient();
		vi.useFakeTimers();
		vi.stubGlobal('fetch', fetchMock);
		fetchMock
			.mockReset()
			.mockImplementation(async () => response('The Matrix'));
		render(
			<QueryClientProvider client={client}>
				<MemoryRouter>
					<MovieSearchPage />
				</MemoryRouter>
			</QueryClientProvider>
		);
	});

	afterEach(() => {
		cleanup();
		client.clear();
		vi.useRealTimers();
		vi.unstubAllGlobals();
		useAuthStore.setState(useAuthStore.getInitialState(), true);
	});

	it('retains previous results during typing and loads the new search after the debounce', async () => {
		type('Matrix');
		await advance();
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
		let resolve!: (value: Response) => void;
		fetchMock.mockImplementationOnce(
			() =>
				new Promise((done) => {
					resolve = done;
				})
		);
		type('Inception');
		await advance(499);
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
		expect(fetchMock).toHaveBeenCalledOnce();
		await advance(1);
		expect(screen.queryByText('The Matrix')).not.toBeInTheDocument();
		expect(screen.getByText('Searching for movies...')).toBeInTheDocument();
		resolve(response('Inception'));
		await advance(1);
		expect(screen.getByText('Inception')).toBeInTheDocument();
		type('');
		expect(screen.queryByText('Inception')).not.toBeInTheDocument();
		expect(
			screen.getByText('Start typing to search for movies.')
		).toBeInTheDocument();
	});

	it('shows cached results when revisiting a search and refreshes them in the background', async () => {
		type('Matrix');
		await advance();
		fetchMock.mockImplementationOnce(async () => response('Inception'));
		type('Inception');
		await advance();
		let resolve!: (value: Response) => void;
		fetchMock.mockImplementationOnce(
			() =>
				new Promise((done) => {
					resolve = done;
				})
		);
		type('Matrix');
		await advance();
		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
		expect(
			screen.queryByText('Searching for movies...')
		).not.toBeInTheDocument();
		resolve(response('The Matrix refreshed'));
		await advance(1);
		expect(screen.getByText('The Matrix refreshed')).toBeInTheDocument();
	});

	it('separates locale caches and hides results immediately on every language change', async () => {
		type('Matrix');
		await advance();
		await act(async () => {
			await changeActiveLocale('fr-FR');
		});
		expect(screen.queryByText('The Matrix')).not.toBeInTheDocument();
		await advance(200);
		await act(async () => {
			await changeActiveLocale('en-US');
		});
		expect(screen.queryByText('The Matrix')).not.toBeInTheDocument();
		await advance(499);
		expect(fetchMock).toHaveBeenCalledOnce();
		await advance(2);
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
		fetchMock.mockImplementationOnce(async () => response('Matrix français'));
		await act(async () => {
			await changeActiveLocale('fr-FR');
		});
		await advance();
		expect(request(2).headers.get('Accept-Language')).toBe('fr-FR');
		expect(screen.getByText('Matrix français')).toBeInTheDocument();
		expect(
			client.getQueryData<TMDBMovieSearchResult>([
				'movie-search',
				'en-US',
				'Matrix',
			])?.results[0].title
		).toBe('The Matrix');
	});

	it('aborts superseded requests and ignores late responses without showing errors', async () => {
		let resolveOld!: (value: Response) => void;
		fetchMock.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					resolveOld = resolve;
				})
		);
		type('Old movie');
		await advance();
		type('Matrix');
		await advance();
		expect(request(0).signal.aborted).toBe(true);
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
		resolveOld(response('Old movie'));
		await advance(1);
		expect(screen.queryByText('Old movie')).not.toBeInTheDocument();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
	});

	it('aborts and clears an in-flight search immediately below the minimum length', async () => {
		let resolve!: (value: Response) => void;
		fetchMock.mockImplementationOnce(
			() =>
				new Promise((done) => {
					resolve = done;
				})
		);
		type('Matrix');
		await advance();
		type('Ma');
		expect(request(0).signal.aborted).toBe(true);
		resolve(response('The Matrix'));
		await advance();
		expect(screen.queryByText('The Matrix')).not.toBeInTheDocument();
		expect(
			screen.getByText('Start typing to search for movies.')
		).toBeInTheDocument();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('aborts an in-flight search when the page unmounts', async () => {
		fetchMock.mockImplementationOnce(() => new Promise(() => undefined));
		type('Matrix');
		await advance();
		cleanup();
		expect(request(0).signal.aborted).toBe(true);
	});

	it('shows an initial failure and recovers through Retry', async () => {
		fetchMock.mockImplementationOnce(
			async () => new Response(null, { status: 403 })
		);
		type('Matrix');
		await advance();
		expect(screen.getByRole('alert')).toHaveTextContent(
			'Unable to search movies. Please try again.'
		);
		expect(fetchMock).toHaveBeenCalledOnce();
		fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
		await advance(0);
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('keeps cached results on refresh failure and disables Retry while recovery is pending', async () => {
		type('Matrix');
		await advance();
		type('');
		fetchMock.mockImplementationOnce(
			async () => new Response(null, { status: 403 })
		);
		type('Matrix');
		await advance();
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText('The Matrix')).toBeInTheDocument();
		let resolve!: (value: Response) => void;
		fetchMock.mockImplementationOnce(
			() =>
				new Promise((done) => {
					resolve = done;
				})
		);
		fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
		await advance(0);
		expect(screen.getByRole('button', { name: 'Retry' })).toBeDisabled();
		resolve(response('Updated Matrix'));
		await advance(1);
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(screen.getByText('Updated Matrix')).toBeInTheDocument();
	});

	it('preserves whitespace and uses the same three-character rule', async () => {
		type('   ');
		await advance();
		expect(new URL(request(0).url).searchParams.get('query')).toBe('   ');
	});
});
