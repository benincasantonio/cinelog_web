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
import MovieSearchPage from './MovieSearchPage';

vi.hoisted(() => vi.stubEnv('VITE_API_URL', 'https://api.example.test/'));
afterAll(() => vi.unstubAllEnvs());

describe('MovieSearchPage', () => {
	let client: ReturnType<typeof createQueryClient>;
	const fetchMock = vi.fn<typeof fetch>();

	beforeEach(async () => {
		await changeActiveLocale('en-US');
		useAuthStore.setState({ authenticatedStatus: true });
		client = createQueryClient();
		vi.useFakeTimers();
		vi.stubGlobal('fetch', fetchMock);
		fetchMock
			.mockReset()
			.mockImplementation(async () => Response.json({ results: [] }));
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

	const type = (value: string) =>
		fireEvent.change(screen.getByRole('textbox'), { target: { value } });
	const advance = (ms: number) =>
		act(async () => {
			await vi.advanceTimersByTimeAsync(ms);
		});

	it('renders its heading, input and initial prompt without fetching', () => {
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
		expect(document.title).toBe('Cinelog - Search');
		expect(
			screen.getByText('Start typing to search for movies.')
		).toBeInTheDocument();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('waits 500 ms after the final input and never searches fewer than three characters', async () => {
		type('ab');
		await advance(500);
		expect(fetchMock).not.toHaveBeenCalled();
		type('Mat');
		await advance(300);
		type('Matrix');
		await advance(499);
		expect(fetchMock).not.toHaveBeenCalled();
		await advance(1);
		expect(fetchMock).toHaveBeenCalledOnce();
		expect(
			new URL((fetchMock.mock.calls[0][0] as Request).url).searchParams.get(
				'query'
			)
		).toBe('Matrix');
		await advance(1);
		expect(
			screen.getByText('No movies found. Try searching for something!')
		).toBeInTheDocument();
		type('a');
		expect(
			screen.getByText('Start typing to search for movies.')
		).toBeInTheDocument();
	});

	it('cancels a pending debounce when the page unmounts', async () => {
		type('Matrix');
		cleanup();
		await advance(500);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
