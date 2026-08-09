import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Profile } from './Profile';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@/lib/locales/i18n', () => ({
	changeActiveLocale: vi.fn(),
	getActiveLocale: () => 'en-US',
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Button: ({
		children,
		...props
	}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button type="button" {...props}>
			{children}
		</button>
	),
	useNotification: () => ({ notify: vi.fn() }),
}));

describe('Profile', () => {
	const baseUserInfo = {
		firstName: 'Neo',
		lastName: 'Anderson',
		handle: 'neo',
		dateOfBirth: '1990-01-01',
		profileVisibility: 'public' as const,
		followerCount: 4,
		followingCount: 3,
		isFollowing: false,
	};
	const onFollowStatusChange = vi.fn();

	it('renders header, menu and outlet when user has handle', () => {
		render(
			<MemoryRouter>
				<Profile
					userInfo={baseUserInfo}
					isOwnProfile={true}
					isPrivate={false}
					onFollowStatusChange={onFollowStatusChange}
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
						...baseUserInfo,
						handle: '',
					}}
					isOwnProfile={true}
					isPrivate={false}
					onFollowStatusChange={onFollowStatusChange}
				/>
			</MemoryRouter>
		);

		expect(screen.getByText('Neo Anderson')).toBeInTheDocument();
		expect(screen.queryByText('ProfileMenu.overview')).not.toBeInTheDocument();
	});

	it('renders private profile message when isPrivate is true and not own profile', () => {
		render(
			<MemoryRouter>
				<Profile
					userInfo={{
						...baseUserInfo,
						profileVisibility: 'private',
					}}
					isOwnProfile={false}
					isPrivate={true}
					onFollowStatusChange={onFollowStatusChange}
				/>
			</MemoryRouter>
		);

		expect(screen.getByText('ProfilePage.privateProfile')).toBeInTheDocument();
	});

	it('renders outlet when isPrivate is true but it is own profile', () => {
		render(
			<MemoryRouter>
				<Profile
					userInfo={{
						...baseUserInfo,
						profileVisibility: 'private',
					}}
					isOwnProfile={true}
					isPrivate={false}
					onFollowStatusChange={onFollowStatusChange}
				/>
			</MemoryRouter>
		);

		expect(
			screen.queryByText('ProfilePage.privateProfile')
		).not.toBeInTheDocument();
	});
});
