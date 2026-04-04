import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

import { ProfileMenu } from './ProfileMenu';

describe('ProfileMenu', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders overview and movies watched for any profile', () => {
		render(
			<MemoryRouter initialEntries={['/profile/neo']}>
				<ProfileMenu handle="neo" isOwnProfile={false} />
			</MemoryRouter>
		);

		expect(screen.getByText('ProfileMenu.overview')).toBeInTheDocument();
		expect(screen.getByText('ProfileMenu.moviesWatched')).toBeInTheDocument();
	});

	it('shows Stats and Settings links when viewing own profile', () => {
		render(
			<MemoryRouter initialEntries={['/profile/neo']}>
				<ProfileMenu handle="neo" isOwnProfile={true} />
			</MemoryRouter>
		);

		expect(screen.getByText('ProfileMenu.stats')).toBeInTheDocument();
		expect(screen.getByText('ProfileMenu.settings')).toBeInTheDocument();

		const links = screen.getAllByRole('link');
		expect(links).toHaveLength(4);
		expect(links[2]).toHaveAttribute('href', '/profile/neo/stats');
		expect(links[3]).toHaveAttribute('href', '/profile/neo/settings');
	});

	it('hides Stats and Settings links when viewing another user profile', () => {
		render(
			<MemoryRouter initialEntries={['/profile/morpheus']}>
				<ProfileMenu handle="morpheus" isOwnProfile={false} />
			</MemoryRouter>
		);

		expect(screen.queryByText('ProfileMenu.stats')).not.toBeInTheDocument();
		expect(screen.queryByText('ProfileMenu.settings')).not.toBeInTheDocument();
		expect(screen.getAllByRole('link')).toHaveLength(2);
	});
});
