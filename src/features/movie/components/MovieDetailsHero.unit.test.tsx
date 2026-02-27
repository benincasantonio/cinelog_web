import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MovieDetailsHero } from './MovieDetailsHero';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

describe('MovieDetailsHero', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders backdrop, poster, title year and tagline when available', () => {
		const { container } = render(
			<MovieDetailsHero
				title="The Matrix"
				posterPath="/poster.jpg"
				backdropPath="/backdrop.jpg"
				releaseDate="1999-03-31"
				tagline="Welcome to the Real World"
			/>
		);

		expect(
			container.querySelector('[style*="backdrop.jpg"]')
		).toBeInTheDocument();
		expect(screen.getByAltText('The Matrix')).toHaveAttribute(
			'src',
			'https://image.tmdb.org/t/p/w500/poster.jpg'
		);
		expect(screen.getByText('(1999)')).toBeInTheDocument();
		expect(screen.getByText('Welcome to the Real World')).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole('button', { name: 'MovieDetailsHero.back' })
		);
		expect(mockNavigate).toHaveBeenCalledWith(-1);
	});

	it('renders fallback labels when no backdrop or poster exist', () => {
		render(
			<MovieDetailsHero
				title="No Image Movie"
				posterPath={null}
				backdropPath={null}
				releaseDate="2001-01-01"
				tagline={null}
			/>
		);

		expect(screen.getByText('MovieDetailsHero.noBackdrop')).toBeInTheDocument();
		expect(screen.getByText('MovieDetailsHero.noImage')).toBeInTheDocument();
	});
});
