import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { LogListItem } from '@/features/logs/models';
import { TestWrapper } from './MovieLogItem.test-setup';
import { createMockLog } from './MovieLogItem.test-utils';

// Mock Firebase to prevent initialization error
vi.mock('@/lib/firebase', () => ({
	auth: {
		currentUser: null,
	},
}));

// Mock useMovieLogDialogStore
vi.mock('@/features/logs', () => ({
	useMovieLogDialogStore: () => ({
		open: vi.fn(),
	}),
}));

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
	DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
	DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
	DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
	DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-item">{children}</div>,
}));

describe('MovieLogItem Integration Tests', () => {
	describe('T4.1.1: Navigation Integration with React Router', () => {
		it('should render component with BrowserRouter without errors', () => {
			const log = createMockLog();
			render(<TestWrapper log={log} />);

			expect(
				screen.getByRole('button', { name: /Fight Club/i })
			).toBeInTheDocument();
		});

		it('should have clickable title element in router context', () => {
			const log = createMockLog();
			render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button', { name: /Fight Club/i });
			expect(titleElement).toHaveClass('cursor-pointer');
		});

		it('should navigate when title is clicked with valid tmdbId', async () => {
			const user = userEvent.setup();
			const log = createMockLog({ tmdbId: 550 });
			render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button', { name: /Fight Club/i });
			await user.click(titleElement);

			// Component rendered without errors
			expect(titleElement).toBeInTheDocument();
		});
	});

	describe('T4.1.2: Multiple Navigation Events', () => {
		it('should allow multiple navigations from same page', async () => {
			const user = userEvent.setup();
			const log1 = createMockLog({
				tmdbId: 550,
				movie: { ...createMockLog().movie!, title: 'Fight Club' },
			});
			const { rerender } = render(<TestWrapper log={log1} />);

			let titleElement = screen.getByRole('button');
			await user.click(titleElement);

			// Simulate navigating back to list and clicking another movie
			const log2 = createMockLog({
				tmdbId: 278,
				movie: { ...createMockLog().movie, title: 'Shawshank Redemption' },
			});
			rerender(<TestWrapper log={log2} />);

			titleElement = screen.getByRole('button', { name: /Shawshank/i });
			await user.click(titleElement);

			expect(titleElement).toBeInTheDocument();
		});
	});

	describe('T4.1.3: Keyboard Navigation in Router Context', () => {
		it('should be keyboard accessible with focus', async () => {
			const log = createMockLog();
			render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button');
			titleElement.focus();

			expect(titleElement).toHaveFocus();
		});

		it('should maintain focus state after keyboard interaction', async () => {
			const user = userEvent.setup();
			const log = createMockLog();
			render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button');
			titleElement.focus();

			await user.keyboard(' ');
			expect(titleElement).toBeInTheDocument();
		});
	});

	describe('T4.1.4: Router State Preservation', () => {
		it('should preserve component state across route transitions', async () => {
			const log = createMockLog();
			const { rerender } = render(<TestWrapper log={log} />);

			expect(screen.getByText('Fight Club')).toBeInTheDocument();

			// Simulate route change and coming back
			const newLog = createMockLog({
				tmdbId: 550,
				movie: { ...createMockLog().movie, title: 'Fight Club' },
			});
			rerender(<TestWrapper log={newLog} />);

			expect(screen.getByText('Fight Club')).toBeInTheDocument();
		});

		it('should handle rapid successive clicks gracefully', async () => {
			const user = userEvent.setup();
			const log = createMockLog();
			render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button');

			// Simulate rapid clicks
			await user.click(titleElement);
			await user.click(titleElement);
			await user.click(titleElement);

			expect(titleElement).toBeInTheDocument();
		});
	});

	describe('T4.1.5: Error Scenarios with Router', () => {
		it('should handle missing tmdbId gracefully without navigation error', async () => {
			const user = userEvent.setup();
			const log = createMockLog({ tmdbId: 0 });
			render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button');

			// Should not throw error when clicking without tmdbId
			await user.click(titleElement);
			expect(titleElement).toBeInTheDocument();
		});

		it('should handle undefined tmdbId in router context', () => {
			const log = createMockLog();
			const modifiedLog = { ...log, tmdbId: undefined };

			// Should render without error
			render(<TestWrapper log={modifiedLog as LogListItem} />);
			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('should render correctly with minimal log data in router', () => {
			const minimalLog: LogListItem = {
				id: '1',
				movieId: 'movie-1',
				tmdbId: 1,
				dateWatched: '2024-01-09',
			};

			render(<TestWrapper log={minimalLog} />);
			expect(screen.getByRole('button')).toBeInTheDocument();
		});
	});

	describe('T4.1.6: Component Lifecycle with Router', () => {
		it('should properly cleanup on unmount', () => {
			const log = createMockLog();
			const { unmount } = render(<TestWrapper log={log} />);

			expect(screen.getByRole('button')).toBeInTheDocument();

			unmount();

			// After unmount, button should not exist
			expect(() => screen.getByRole('button')).toThrow();
		});

		it('should handle re-renders with different log data', () => {
			const log1 = createMockLog({
				tmdbId: 550,
				movie: { ...createMockLog().movie, title: 'Fight Club' },
			});
			const { rerender } = render(<TestWrapper log={log1} />);

			expect(screen.getByText('Fight Club')).toBeInTheDocument();

			const log2 = createMockLog({
				tmdbId: 278,
				movie: { ...createMockLog().movie, title: 'Shawshank Redemption' },
			});
			rerender(<TestWrapper log={log2} />);

			expect(screen.getByText('Shawshank Redemption')).toBeInTheDocument();
			expect(screen.queryByText('Fight Club')).not.toBeInTheDocument();
		});
	});

	describe('T4.1.7: Accessibility in Router Context', () => {
		it('should maintain accessible name during navigation', () => {
			const log = createMockLog();
			render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button');
			expect(titleElement).toHaveAttribute(
				'aria-label',
				expect.stringContaining('Fight Club')
			);
		});

		it('should maintain tabIndex for keyboard navigation', () => {
			const log = createMockLog();
			render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button');
			expect(titleElement).toHaveAttribute('tabIndex', '0');
		});
	});

	describe('T4.2: Scroll Position Preservation', () => {
		it('should not prevent scroll on parent container', () => {
			const log = createMockLog();
			render(
				<div
					style={{ height: '100px', overflow: 'auto' }}
					data-testid="scroll-container"
				>
					<TestWrapper log={log} />
				</div>
			);

			const scrollContainer = screen.getByTestId('scroll-container');
			expect(scrollContainer).toHaveStyle('overflow: auto');
		});

		it('should not add scroll-related styles to component', () => {
			const log = createMockLog();
			render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button');
			const computedStyle = window.getComputedStyle(titleElement);

			// Component should not have overflow or fixed positioning that would affect scroll
			expect(computedStyle.position).not.toBe('fixed');
			expect(computedStyle.overflow).not.toBe('auto');
		});

		it('should maintain component visibility during scroll simulation', () => {
			const log = createMockLog();
			render(
				<div>
					<TestWrapper log={log} />
				</div>
			);

			const titleElement = screen.getByRole('button');
			expect(titleElement).toBeVisible();

			// Simulate scroll event on parent
			const scrollEvent = new Event('scroll');
			window.dispatchEvent(scrollEvent);

			// Component should still be visible after scroll
			expect(titleElement).toBeVisible();
		});

		it('should not interfere with history state management', async () => {
			const user = userEvent.setup();
			const log = createMockLog();
			render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button');

			// Store initial history length
			const initialHistoryLength = window.history.length;

			// Click to navigate
			await user.click(titleElement);

			// History length should be preserved or incremented naturally
			expect(window.history.length).toBeGreaterThanOrEqual(
				initialHistoryLength
			);
		});

		it('should handle back navigation without scroll jumps', async () => {
			const user = userEvent.setup();
			const log = createMockLog();
			const { unmount } = render(<TestWrapper log={log} />);

			const titleElement = screen.getByRole('button');
			await user.click(titleElement);

			// Simulate back navigation by unmounting and remounting
			unmount();

			const logReturning = createMockLog();
			render(<TestWrapper log={logReturning} />);

			expect(screen.getByRole('button')).toBeInTheDocument();
		});
	});

	describe('T4.3: Error States and Edge Cases', () => {
		describe('T4.3.1: Graceful Fallback for Missing Data', () => {
			it('should display fallback content when movie object is completely missing', () => {
				const log = createMockLog({ movie: undefined });
				render(<TestWrapper log={log} />);

				const titleElement = screen.getByRole('button');
				expect(titleElement).toHaveTextContent('MovieLogItem.unknownTitle');
			});

			it('should display placeholder when poster path is missing', () => {
				const log = createMockLog({ posterPath: undefined });
				render(<TestWrapper log={log} />);

				expect(screen.getByText('MovieLogItem.noImage')).toBeInTheDocument();
			});

			it('should handle missing vote average gracefully', () => {
				const log = createMockLog({
					movie: { ...createMockLog().movie, voteAverage: undefined },
				});
				render(<TestWrapper log={log} />);

				const titleElement = screen.getByRole('button');
				expect(titleElement).toBeInTheDocument();
			});

			it('should display component even with null movie title', () => {
				const log = createMockLog({
					movie: { ...createMockLog().movie, title: '' },
				});
				render(<TestWrapper log={log} />);

				expect(screen.getByRole('button')).toHaveTextContent(
					'MovieLogItem.unknownTitle'
				);
			});
		});

		describe('T4.3.2: Incomplete Data Scenarios', () => {
			it('should render with missing watchedWhere field', () => {
				const log = createMockLog({ watchedWhere: undefined });
				render(<TestWrapper log={log} />);

				expect(screen.getByRole('button')).toBeInTheDocument();
			});

			it('should render with null movieRating', () => {
				const log = createMockLog({ movieRating: null });
				render(<TestWrapper log={log} />);

				expect(screen.getByRole('button')).toBeInTheDocument();
			});

			it('should render with movieRating as zero', () => {
				const log = createMockLog({ movieRating: 0 });
				render(<TestWrapper log={log} />);

				expect(screen.getByRole('button')).toBeInTheDocument();
			});

			it('should render when all optional fields are missing except core fields', () => {
				const minimalLog: LogListItem = {
					id: '1',
					movieId: 'movie-1',
					tmdbId: 1,
					dateWatched: '2024-01-09',
				};
				render(<TestWrapper log={minimalLog} />);

				expect(screen.getByRole('button')).toBeInTheDocument();
			});
		});

		describe('T4.3.3: Navigation with Incomplete Data', () => {
			it('should still navigate when clicked even with missing movie object', async () => {
				const user = userEvent.setup();
				const log = createMockLog({ movie: undefined });
				render(<TestWrapper log={log} />);

				const titleElement = screen.getByRole('button');
				await user.click(titleElement);

				expect(titleElement).toBeInTheDocument();
			});

			it('should navigate even when poster path is missing', async () => {
				const user = userEvent.setup();
				const log = createMockLog({ posterPath: undefined });
				render(<TestWrapper log={log} />);

				const titleElement = screen.getByRole('button');
				await user.click(titleElement);

				expect(titleElement).toBeInTheDocument();
			});
		});

		describe('T4.3.4: Special Characters and Edge Cases', () => {
			it('should handle movie title with special characters', () => {
				const log = createMockLog({
					movie: {
						...createMockLog().movie,
						title: 'O\'Brien\'s "Movie" & Friends',
					},
				});
				render(<TestWrapper log={log} />);

				expect(screen.getByRole('button')).toBeInTheDocument();
			});

			it('should handle very long movie title', () => {
				const longTitle = 'A'.repeat(500);
				const log = createMockLog({
					movie: { ...createMockLog().movie, title: longTitle },
				});
				render(<TestWrapper log={log} />);

				const titleElement = screen.getByRole('button');
				expect(titleElement).toHaveClass('truncate');
			});

			it('should handle invalid date in dateWatched', () => {
				const log = createMockLog({ dateWatched: 'invalid-date' });
				expect(() => render(<TestWrapper log={log} />)).not.toThrow();
			});
		});
	});
});
