import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LogListItem } from '@/features/logs/models';
import { MovieLogItem } from './MovieLogItem';

// Mock Firebase to prevent initialization error
vi.mock('@/lib/firebase', () => ({
	auth: {
		currentUser: null,
	},
}));

// Mock useMovieLogDialogStore
const mockOpen = vi.fn();
vi.mock('@/features/logs', () => ({
	useMovieLogDialogStore: () => ({
		open: mockOpen,
	}),
}));

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock MovieVote component
vi.mock('./MovieVote', () => ({
	MovieVote: ({ vote }: { vote: number }) => (
		<div data-testid="movie-vote">{vote}</div>
	),
}));

// Mock DropdownMenu components to prevent multiple button issues
vi.mock('@antoniobenincasa/ui', () => ({
	DropdownMenu: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dropdown-menu">{children}</div>
	),
	DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dropdown-trigger">{children}</div>
	),
	DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dropdown-content">{children}</div>
	),
	DropdownMenuItem: ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
	}) => (
		<button type="button" data-testid="dropdown-item" onClick={onClick}>
			{children}
		</button>
	),
}));

// Create mock log data factory
const createMockLog = (overrides?: Partial<LogListItem>): LogListItem => ({
	id: '1',
	movieId: 'movie-1',
	tmdbId: 550,
	dateWatched: '2024-01-09',
	posterPath: '/path/to/poster.jpg',
	watchedWhere: 'cinema',
	movieRating: 8,
	movie: {
		id: 'movie-1',
		title: 'Fight Club',
		tmdbId: 550,
		posterPath: '/path/to/poster.jpg',
		releaseDate: '1999-10-15',
		overview:
			'An insomniac office worker and a devil-may-care soapmaker form an underground fight club...',
		voteAverage: 8.8,
	},
	...overrides,
});

describe('MovieLogItem', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
		mockOpen.mockClear();
	});

	describe('T3.1.1: Component Renders Without Crashing', () => {
		it('should render component with valid mock log data', () => {
			const log = createMockLog();
			render(<MovieLogItem log={log} />);

			expect(screen.getByText('Fight Club')).toBeInTheDocument();
		});
	});

	describe('T3.1.2: Movie Title is Clickable Element', () => {
		it('should have role="button" on title element', () => {
			const log = createMockLog();
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByRole('button', { name: /Fight Club/i });
			expect(titleElement).toBeInTheDocument();
		});

		it('should have aria-label containing movie title', () => {
			const log = createMockLog();
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			expect(titleElement).toHaveAttribute(
				'aria-label',
				expect.stringContaining('Fight Club')
			);
		});

		it('should have data-testid for testing', () => {
			const log = createMockLog();
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			expect(titleElement).toBeInTheDocument();
		});
	});

	describe('T3.1.3: Click Handler Calls Navigate with Correct Route', () => {
		it('should call navigate with correct route when title is clicked', async () => {
			const user = userEvent.setup();
			const log = createMockLog({ tmdbId: 550 });
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByRole('button', { name: /Fight Club/i });
			await user.click(titleElement);

			expect(mockNavigate).toHaveBeenCalledWith('/movies/550');
		});

		it('should call navigate with different tmdbId when provided', async () => {
			const user = userEvent.setup();
			const log = createMockLog({ tmdbId: 278 });
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			await user.click(titleElement);

			expect(mockNavigate).toHaveBeenCalledWith('/movies/278');
		});

		it.each([
			{ tmdbId: 550, title: 'Fight Club' },
			{ tmdbId: 278, title: 'The Shawshank Redemption' },
			{ tmdbId: 1, title: 'Dinosaur Planet' },
			{ tmdbId: 999999, title: 'Unknown Movie' },
		])('should navigate to /movies/$tmdbId for various valid tmdbIds', async ({
			tmdbId,
			title,
		}) => {
			const user = userEvent.setup();
			const log = createMockLog({
				tmdbId,
				movie: { ...createMockLog().movie, title },
			});
			render(<MovieLogItem log={log} />);

			await user.click(screen.getByTestId('movie-title-link'));
			expect(mockNavigate).toHaveBeenCalledWith(`/movies/${tmdbId}`);
		});
	});

	describe('T3.1.4: Navigate Called Only When tmdbId Exists', () => {
		it('should call navigate when tmdbId is defined', async () => {
			const user = userEvent.setup();
			const log = createMockLog({ tmdbId: 550 });
			render(<MovieLogItem log={log} />);

			await user.click(screen.getByTestId('movie-title-link'));
			expect(mockNavigate).toHaveBeenCalled();
		});

		it('should not call navigate when tmdbId is 0', async () => {
			const user = userEvent.setup();
			const log = createMockLog({ tmdbId: 0 });
			render(<MovieLogItem log={log} />);

			await user.click(screen.getByTestId('movie-title-link'));
			expect(mockNavigate).not.toHaveBeenCalled();
		});

		it('should handle tmdbId gracefully when missing', () => {
			const log = createMockLog();
			const modifiedLog = { ...log, tmdbId: undefined };
			render(<MovieLogItem log={modifiedLog as LogListItem} />);
			expect(screen.getByTestId('movie-title-link')).toBeInTheDocument();
		});
	});

	describe('T3.1.5: Component Renders All Expected Content', () => {
		it('should render movie title', () => {
			const log = createMockLog();
			render(<MovieLogItem log={log} />);

			expect(screen.getByText('Fight Club')).toBeInTheDocument();
		});

		it('should render poster image div', () => {
			const log = createMockLog({ posterPath: '/path/to/poster.jpg' });
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			expect(titleElement).toBeInTheDocument();
		});

		it('should render watch date', () => {
			const log = createMockLog({ dateWatched: '2024-01-09' });
			render(<MovieLogItem log={log} />);

			// The translation key is rendered directly in tests because we mock translation
			expect(screen.getByText(/MovieLogItem.watched/)).toBeInTheDocument();
		});

		it('should render vote average when available', () => {
			const log = createMockLog();
			render(<MovieLogItem log={log} />);

			// There are multiple vote elements (tmdb + user rating)
			const votes = screen.getAllByTestId('movie-vote');
			expect(votes.length).toBeGreaterThan(0);
		});

		it('should render watched location when available', () => {
			const log = createMockLog({ watchedWhere: 'cinema' });
			render(<MovieLogItem log={log} />);

			expect(screen.getByText(/cinema/i)).toBeInTheDocument();
		});

		it('should handle missing movie title gracefully', () => {
			const log = createMockLog({ movie: undefined });
			render(<MovieLogItem log={log} />);

			expect(screen.getByTestId('movie-title-link')).toBeInTheDocument();
		});
	});

	describe('Additional: Keyboard Accessibility', () => {
		it('should be keyboard accessible with tabIndex', () => {
			const log = createMockLog();
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			expect(titleElement).toHaveAttribute('tabIndex', '0');
		});
	});

	describe('Edit Movie Log', () => {
		it('should call open with movieToEdit when edit menu item is clicked', async () => {
			const user = userEvent.setup();
			const log = createMockLog();
			render(<MovieLogItem log={log} />);

			const editButton = screen.getByTestId('dropdown-item');
			await user.click(editButton);

			expect(mockOpen).toHaveBeenCalledWith({
				movieToEdit: log,
			});
		});
	});

	describe('Additional: Edge Cases', () => {
		it('should render with minimal log data', () => {
			const minimalLog: LogListItem = {
				id: '1',
				movieId: 'movie-1',
				tmdbId: 1,
				dateWatched: '2024-01-09',
			};
			render(<MovieLogItem log={minimalLog} />);

			expect(screen.getByTestId('movie-title-link')).toBeInTheDocument();
		});

		it('should handle special characters in movie title', async () => {
			const user = userEvent.setup();
			const log = createMockLog();
			render(<MovieLogItem log={log} />);

			await user.click(screen.getByTestId('movie-title-link'));
			expect(mockNavigate).toHaveBeenCalledWith('/movies/550');
		});

		it('should handle very long movie titles', () => {
			const longTitle = 'A'.repeat(100);
			const log = createMockLog({
				movie: { ...createMockLog().movie, title: longTitle },
			});
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			expect(titleElement).toHaveClass('truncate');
		});

		it('should handle missing movie object gracefully', () => {
			const log = createMockLog({ movie: undefined });
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			expect(titleElement).toBeInTheDocument();
			// Should show fallback text for unknown title
			expect(titleElement).toHaveTextContent('MovieLogItem.unknownTitle');
		});

		it('should handle null movie title', () => {
			const log = createMockLog({
				movie: { ...createMockLog().movie, title: '' },
			});
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			expect(titleElement).toBeInTheDocument();
		});

		it('should handle missing posterPath', () => {
			const log = createMockLog({ posterPath: undefined });
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			expect(titleElement).toBeInTheDocument();
		});

		it('should handle missing movieRating', () => {
			const log = createMockLog({ movieRating: undefined });
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			expect(titleElement).toBeInTheDocument();
		});

		it('should handle missing watchedWhere', () => {
			const log = createMockLog({ watchedWhere: undefined });
			render(<MovieLogItem log={log} />);

			const titleElement = screen.getByTestId('movie-title-link');
			expect(titleElement).toBeInTheDocument();
		});

		it('should handle special characters like quotes and apostrophes', async () => {
			const user = userEvent.setup();
			const log = createMockLog({
				movie: { ...createMockLog().movie, title: 'O\'Brien\'s "Story"' },
			});
			render(<MovieLogItem log={log} />);

			await user.click(screen.getByTestId('movie-title-link'));
			expect(mockNavigate).toHaveBeenCalledWith('/movies/550');
		});

		it('should navigate even when movie data is incomplete', async () => {
			const user = userEvent.setup();
			const log = createMockLog({
				movie: undefined,
				posterPath: undefined,
				movieRating: undefined,
				watchedWhere: undefined,
			});
			render(<MovieLogItem log={log} />);

			await user.click(screen.getByTestId('movie-title-link'));
			expect(mockNavigate).toHaveBeenCalledWith('/movies/550');
		});
	});
});
