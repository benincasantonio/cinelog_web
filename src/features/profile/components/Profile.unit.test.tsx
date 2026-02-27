import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Profile } from './Profile';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

describe('Profile', () => {
	it('renders header, menu and outlet when user has handle', () => {
		render(
			<MemoryRouter>
				<Profile
					userInfo={{
						id: '1',
						firstName: 'Neo',
						lastName: 'Anderson',
						email: 'neo@matrix.dev',
						handle: 'neo',
						dateOfBirth: '1990-01-01',
					}}
				/>
			</MemoryRouter>
		);

		expect(screen.getByText('Neo Anderson')).toBeInTheDocument();
		expect(screen.getByText('ProfileHeader.noBio')).toBeInTheDocument();
		expect(screen.getByText('ProfileMenu.overview')).toBeInTheDocument();
	});

	it('does not render menu when user handle is missing', () => {
		render(
			<MemoryRouter>
				<Profile
					userInfo={{
						id: '2',
						firstName: 'Trinity',
						lastName: 'Unknown',
						email: 'trinity@matrix.dev',
						handle: '',
						dateOfBirth: '1991-02-02',
						bio: 'Operator',
					}}
				/>
			</MemoryRouter>
		);

		expect(screen.getByText('Trinity Unknown')).toBeInTheDocument();
		expect(screen.getByText('Operator')).toBeInTheDocument();
		expect(screen.queryByText('ProfileMenu.overview')).not.toBeInTheDocument();
	});
});
