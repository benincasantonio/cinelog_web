import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MovieGenres } from './MovieGenres';

describe('MovieGenres', () => {
	it('renders all provided genres', () => {
		render(
			<MovieGenres
				genres={[
					{ id: 1, name: 'Action' },
					{ id: 2, name: 'Comedy' },
				]}
			/>
		);

		expect(screen.getByText('Action')).toBeInTheDocument();
		expect(screen.getByText('Comedy')).toBeInTheDocument();
	});
});
