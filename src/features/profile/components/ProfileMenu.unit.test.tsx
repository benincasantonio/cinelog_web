import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

import { ProfileMenu } from './ProfileMenu';

describe('ProfileMenu', () => {
	it('renders all profile navigation links for a handle', () => {
		render(
			<MemoryRouter>
				<ProfileMenu handle="neo" />
			</MemoryRouter>
		);

		expect(screen.getByText('ProfileMenu.overview')).toBeInTheDocument();
		expect(screen.getByText('ProfileMenu.moviesWatched')).toBeInTheDocument();
		expect(screen.getByText('ProfileMenu.stats')).toBeInTheDocument();

		const links = screen.getAllByRole('link');
		expect(links[0]).toHaveAttribute('href', '/profile/neo');
		expect(links[1]).toHaveAttribute('href', '/profile/neo/movie-watched');
		expect(links[2]).toHaveAttribute('href', '/profile/neo/stats');
	});
});
