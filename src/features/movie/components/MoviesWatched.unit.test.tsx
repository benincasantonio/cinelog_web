import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HTTPError } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetLogs = vi.fn();
const mockUseMovieLogDialogStore = vi.fn();

vi.mock('@/features/logs/repositories', () => ({
	getLogs: (...args: unknown[]) => mockGetLogs(...args),
}));

vi.mock('@/features/logs/stores', () => ({
	useMovieLogDialogStore: (
		selector: (state: { triggerCount: number }) => unknown
	) => selector(mockUseMovieLogDialogStore()),
}));

vi.mock('react-i18next', () => {
	const t = (key: string) => key;
	return { useTranslation: () => ({ t }) };
});

vi.mock('@antoniobenincasa/ui', () => ({
	Select: ({
		value,
		onValueChange,
		children,
	}: {
		value: string;
		onValueChange: (value: string) => void;
		children: React.ReactNode;
	}) => (
		<div data-testid="select" data-value={value}>
			<button
				type="button"
				data-testid="select-all"
				onClick={() => onValueChange('all')}
			>
				all
			</button>
			{children}
		</div>
	),
	SelectTrigger: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	SelectValue: ({ placeholder }: { placeholder?: string }) => (
		<span>{placeholder}</span>
	),
	SelectContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	SelectItem: ({
		children,
		value,
	}: {
		children: React.ReactNode;
		value: string;
	}) => <div data-testid={`select-item-${value}`}>{children}</div>,
}));

vi.mock('./MovieLogList', () => ({
	MovieLogList: ({
		logs,
		uniqueTitles,
		totalRewatches,
	}: {
		logs: unknown[];
		uniqueTitles: number;
		totalRewatches: number;
	}) => (
		<div
			data-testid="movie-log-list"
			data-unique-titles={uniqueTitles}
			data-total-rewatches={totalRewatches}
		>
			{logs.length}
		</div>
	),
}));

vi.mock('./MoviesWatchedLoading', () => ({
	MoviesWatchedLoading: () => <div data-testid="movies-watched-loading" />,
}));

import { MoviesWatched } from './MoviesWatched';

function createHttpError(errorCodeName: string) {
	const response = new Response(
		JSON.stringify({
			error_code_name: errorCodeName,
			error_code: 403,
			error_message: 'Forbidden',
			error_description: 'Profile is not public',
		}),
		{ status: 403 }
	);
	const request = new Request('http://localhost/v1/logs/test');
	return new HTTPError(response, request, {} as never);
}

describe('MoviesWatched', () => {
	const handle = 'neo';

	beforeEach(() => {
		vi.resetAllMocks();
		mockUseMovieLogDialogStore.mockReturnValue({ triggerCount: 0 });
	});

	it('renders loading first and then movies list', async () => {
		const currentYear = new Date().getFullYear();
		mockGetLogs.mockResolvedValueOnce({
			logs: [{ id: '1' }, { id: '2' }],
			totalWatches: 2,
			uniqueTitles: 1,
			totalRewatches: 1,
		});

		render(<MoviesWatched handle={handle} />);

		expect(screen.getByTestId('movies-watched-loading')).toBeInTheDocument();

		await waitFor(() =>
			expect(screen.getByTestId('movie-log-list')).toHaveTextContent('2')
		);
		expect(screen.getByTestId('movie-log-list')).toHaveAttribute(
			'data-unique-titles',
			'1'
		);
		expect(screen.getByTestId('movie-log-list')).toHaveAttribute(
			'data-total-rewatches',
			'1'
		);
		expect(mockGetLogs).toHaveBeenCalledWith(handle, {
			dateWatchedFrom: `${currentYear}-01-01`,
			dateWatchedTo: `${currentYear}-12-31`,
		});
	});

	it('fetches all years when year filter changes to all', async () => {
		const user = userEvent.setup();
		mockGetLogs
			.mockResolvedValueOnce({
				logs: [],
				totalWatches: 0,
				uniqueTitles: 0,
				totalRewatches: 0,
			})
			.mockResolvedValueOnce({
				logs: [{ id: '1' }, { id: '2' }],
				totalWatches: 2,
				uniqueTitles: 1,
				totalRewatches: 1,
			});

		render(<MoviesWatched handle={handle} />);
		await waitFor(() =>
			expect(screen.getByTestId('movie-log-list')).toBeInTheDocument()
		);

		await user.click(screen.getByTestId('select-all'));

		await waitFor(() => expect(mockGetLogs).toHaveBeenCalledWith(handle, {}));
		await waitFor(() =>
			expect(screen.getByTestId('movie-log-list')).toHaveAttribute(
				'data-total-rewatches',
				'1'
			)
		);
		expect(screen.getByTestId('movie-log-list')).toHaveAttribute(
			'data-unique-titles',
			'1'
		);
		expect(screen.getByTestId('movie-log-list')).toHaveTextContent('2');
	});

	it.each([
		[
			'added rewatch',
			{
				logs: [{ id: '1' }, { id: '2' }],
				totalWatches: 2,
				uniqueTitles: 1,
				totalRewatches: 1,
			},
		],
		[
			'removed last viewing',
			{ logs: [], totalWatches: 0, uniqueTitles: 0, totalRewatches: 0 },
		],
	])('refreshes entries and counts after %s', async (_, response) => {
		mockGetLogs.mockResolvedValueOnce({
			logs: [{ id: '1' }],
			totalWatches: 1,
			uniqueTitles: 1,
			totalRewatches: 0,
		});
		const { rerender } = render(<MoviesWatched handle={handle} />);
		await screen.findByTestId('movie-log-list');
		mockGetLogs.mockResolvedValueOnce(response);
		mockUseMovieLogDialogStore.mockReturnValue({ triggerCount: 1 });
		rerender(<MoviesWatched handle={handle} />);
		await waitFor(() =>
			expect(screen.getByTestId('movie-log-list')).toHaveTextContent(
				String(response.logs.length)
			)
		);
		expect(screen.getByTestId('movie-log-list')).toHaveAttribute(
			'data-unique-titles',
			String(response.uniqueTitles)
		);
		expect(screen.getByTestId('movie-log-list')).toHaveAttribute(
			'data-total-rewatches',
			String(response.totalRewatches)
		);
		expect(mockGetLogs).toHaveBeenCalledTimes(2);
	});

	it('renders fallback translated error for unknown thrown values', async () => {
		mockGetLogs.mockRejectedValueOnce('unknown-error');

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByText('MoviesWatched.errorLoading')).toBeInTheDocument()
		);
	});

	it('renders Error message when request throws Error instance', async () => {
		mockGetLogs.mockRejectedValueOnce(new Error('network-failed'));

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByText('network-failed')).toBeInTheDocument()
		);
	});

	it('renders profile not public error when API returns PROFILE_NOT_PUBLIC', async () => {
		mockGetLogs.mockRejectedValueOnce(createHttpError('PROFILE_NOT_PUBLIC'));

		render(<MoviesWatched handle={handle} />);

		await waitFor(() =>
			expect(screen.getByText('ApiError.profileNotPublic')).toBeInTheDocument()
		);
	});
});
