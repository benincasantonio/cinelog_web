import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProfileLoading } from './ProfileLoading';

vi.mock('@antoniobenincasa/ui', () => ({
	Skeleton: ({ className }: { className?: string }) => (
		<div data-testid="skeleton" className={className} />
	),
}));

vi.mock('@/features/movie/components/MoviesWatchedLoading', () => ({
	MoviesWatchedLoading: () => (
		<div data-testid="movies-watched-loading">Movies watched loading</div>
	),
}));

describe('ProfileLoading', () => {
	it('renders profile sidebar skeleton and movies watched loading content', () => {
		const { container } = render(<ProfileLoading />);

		expect(screen.getByTestId('movies-watched-loading')).toBeInTheDocument();
		expect(screen.getAllByTestId('skeleton')).toHaveLength(8);
		expect(container.querySelector('aside')).toBeInTheDocument();
		expect(screen.getByRole('main')).toHaveClass(
			'lg:col-span-9',
			'xl:col-span-9'
		);
	});
});
