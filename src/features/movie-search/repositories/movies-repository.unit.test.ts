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
import { changeActiveLocale } from '@/lib/locales/i18n';
import { search } from './movies-repository';

vi.hoisted(() => vi.stubEnv('VITE_API_URL', 'https://api.example.test/'));
afterAll(() => vi.unstubAllEnvs());

describe('search', () => {
	const fetchMock = vi.fn<typeof fetch>();
	const response = { page: 1, totalPages: 1, totalResults: 0, results: [] };

	beforeEach(async () => {
		vi.stubGlobal('fetch', fetchMock);
		fetchMock
			.mockReset()
			.mockImplementation(async () => Response.json(response));
		useAuthStore.setState({ authenticatedStatus: true });
		await changeActiveLocale('en-US');
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		useAuthStore.setState(useAuthStore.getInitialState(), true);
	});

	it('preserves the existing single-argument call and active locale', async () => {
		await expect(search('The Matrix')).resolves.toEqual(response);
		const request = fetchMock.mock.calls[0][0] as Request;
		expect(new URL(request.url).pathname).toBe('/v1/movies/search');
		expect(new URL(request.url).searchParams.get('query')).toBe('The Matrix');
		expect(request.headers.get('Accept-Language')).toBe('en-US');
	});

	it('uses the supplied locale and forwards cancellation to the HTTP request', async () => {
		const controller = new AbortController();
		await search('Matrix', { locale: 'it-IT', signal: controller.signal });
		const request = fetchMock.mock.calls[0][0] as Request;
		expect(request.headers.get('Accept-Language')).toBe('it-IT');
		controller.abort();
		expect(request.signal.aborted).toBe(true);
	});
});
