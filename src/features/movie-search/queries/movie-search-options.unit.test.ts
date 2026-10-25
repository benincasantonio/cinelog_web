import { QueryObserver } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
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
import { movieSearchOptions } from './movie-search-options';

vi.hoisted(() => vi.stubEnv('VITE_API_URL', 'https://api.example.test/'));
afterAll(() => vi.unstubAllEnvs());

describe('movieSearchOptions', () => {
	let client: ReturnType<typeof createQueryClient>;
	const fetchMock = vi.fn<typeof fetch>();
	const response = { page: 1, totalPages: 1, totalResults: 0, results: [] };

	beforeEach(() => {
		client = createQueryClient();
		useAuthStore.setState({ authenticatedStatus: true });
		vi.stubGlobal('fetch', fetchMock);
		fetchMock
			.mockReset()
			.mockImplementation(async () => Response.json(response));
	});

	afterEach(() => {
		client.clear();
		vi.unstubAllGlobals();
		useAuthStore.setState(useAuthStore.getInitialState(), true);
	});

	it.each([
		'',
		'ab',
	])('does not request results for input shorter than three characters: %s', async (query) => {
		const observer = new QueryObserver(
			client,
			movieSearchOptions(query, 'en-US')
		);
		const unsubscribe = observer.subscribe(() => undefined);
		try {
			await new Promise((resolve) => setTimeout(resolve, 0));
			expect(fetchMock).not.toHaveBeenCalled();
		} finally {
			unsubscribe();
		}
	});

	it('aborts the HTTP request when its last consumer leaves', async () => {
		fetchMock.mockImplementation(() => new Promise(() => undefined));
		const observer = new QueryObserver(
			client,
			movieSearchOptions('Matrix', 'en-US')
		);
		const unsubscribe = observer.subscribe(() => undefined);
		await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
		const request = fetchMock.mock.calls[0][0] as Request;
		unsubscribe();
		expect(request.signal.aborted).toBe(true);
		expect(observer.getCurrentResult().isError).toBe(false);
	});

	it('shares concurrent searches and caches them by text and locale', async () => {
		await Promise.all([
			client.fetchQuery(movieSearchOptions('Matrix', 'it-IT')),
			client.fetchQuery(movieSearchOptions('Matrix', 'it-IT')),
		]);
		expect(fetchMock).toHaveBeenCalledOnce();
		expect(client.getQueryData(['movie-search', 'it-IT', 'Matrix'])).toEqual(
			response
		);
		await client.fetchQuery(movieSearchOptions('Matrix', 'fr-FR'));
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(
			(fetchMock.mock.calls[1][0] as Request).headers.get('Accept-Language')
		).toBe('fr-FR');
	});
});
