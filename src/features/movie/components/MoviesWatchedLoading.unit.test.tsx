import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MoviesWatchedLoading } from './MoviesWatchedLoading';

vi.mock('@antoniobenincasa/ui', () => ({
	Skeleton: ({ className }: { className?: string }) => (
		<div data-testid="skeleton" className={className} />
	),
}));

describe('MoviesWatchedLoading', () => {
	it('renders all loading skeleton placeholders', () => {
		render(<MoviesWatchedLoading />);

		expect(screen.getAllByTestId('skeleton')).toHaveLength(33);
	});
});
