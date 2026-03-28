import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const mockUserInfo = {
	id: '1',
	firstName: 'Neo',
	lastName: 'Anderson',
	email: 'neo@matrix.com',
	handle: 'neo',
	dateOfBirth: '1990-01-01',
};

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: (
		selector: (state: { userInfo: typeof mockUserInfo | null }) => unknown
	) => selector({ userInfo: mockUserInfo }),
}));

import { ProfileMenu } from './ProfileMenu';

describe('ProfileMenu', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders all profile navigation links for a handle', () => {
		render(
			<MemoryRouter initialEntries={['/profile/neo']}>
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
		expect(links[0].className).toContain('bg-primary/10');
		expect(links[1].className).toContain('text-gray-600');
	});

	it('shows Settings link when viewing own profile', () => {
		render(
			<MemoryRouter initialEntries={['/profile/neo']}>
				<ProfileMenu handle="neo" />
			</MemoryRouter>
		);

		expect(screen.getByText('ProfileMenu.settings')).toBeInTheDocument();
		const links = screen.getAllByRole('link');
		expect(links[3]).toHaveAttribute('href', '/profile/neo/settings');
	});

	it('hides Settings link when viewing another user profile', () => {
		render(
			<MemoryRouter initialEntries={['/profile/morpheus']}>
				<ProfileMenu handle="morpheus" />
			</MemoryRouter>
		);

		expect(screen.queryByText('ProfileMenu.settings')).not.toBeInTheDocument();
		expect(screen.getAllByRole('link')).toHaveLength(3);
	});
});
