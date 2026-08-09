import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('lucide-react', () => ({
	User: () => <svg data-testid="user-icon" />,
}));

import { ProfileHeader } from './ProfileHeader';

const fullUser = {
	firstName: 'John',
	lastName: 'Doe',
	handle: 'johndoe',
	bio: 'Movie lover',
	profileVisibility: 'public' as const,
	dateOfBirth: '1990-01-01',
	followerCount: 12,
	followingCount: 8,
	isFollowing: false,
};

describe('ProfileHeader', () => {
	const onFollowStatusChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderHeader = (userInfo = fullUser, isOwnProfile = false) =>
		render(
			<ProfileHeader
				userInfo={userInfo}
				isOwnProfile={isOwnProfile}
				onFollowStatusChange={onFollowStatusChange}
			/>
		);

	it('should render the user full name', () => {
		renderHeader();

		expect(screen.getByText('John Doe')).toBeInTheDocument();
	});

	it('should render the user handle with @ prefix', () => {
		renderHeader();

		expect(screen.getByText('@johndoe')).toBeInTheDocument();
	});

	it('should not render the handle when it is not provided', () => {
		const { firstName, lastName, bio } = fullUser;
		renderHeader({ ...fullUser, firstName, lastName, handle: '', bio });

		expect(screen.queryByText(/@/)).not.toBeInTheDocument();
	});

	it('should render the bio when provided', () => {
		renderHeader();

		expect(screen.getByText('Movie lover')).toBeInTheDocument();
	});

	it('should render the noBio placeholder when bio is missing', () => {
		const { firstName, lastName, handle } = fullUser;
		renderHeader({ ...fullUser, firstName, lastName, handle, bio: undefined });

		expect(screen.getByText('ProfileHeader.noBio')).toBeInTheDocument();
	});

	it('should render the about section heading', () => {
		renderHeader();

		expect(screen.getByText('ProfileHeader.about')).toBeInTheDocument();
	});

	it('should render the user icon', () => {
		renderHeader();

		expect(screen.getByTestId('user-icon')).toBeInTheDocument();
	});

	it('should handle null userInfo', () => {
		render(
			<ProfileHeader
				userInfo={null}
				isOwnProfile={false}
				onFollowStatusChange={onFollowStatusChange}
			/>
		);

		expect(screen.getByText('ProfileHeader.noBio')).toBeInTheDocument();
		expect(screen.getByText('ProfileHeader.about')).toBeInTheDocument();
	});

	it('renders non-clickable follower and following counts', () => {
		renderHeader();

		expect(screen.getByText('12')).toBeInTheDocument();
		expect(screen.getByText('ProfileHeader.followers')).toBeInTheDocument();
		expect(screen.getByText('8')).toBeInTheDocument();
		expect(screen.getByText('ProfileHeader.following')).toBeInTheDocument();
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
	});

	it('does not render a follow control on the own profile', () => {
		renderHeader(fullUser, true);

		expect(
			screen.queryByRole('button', { name: 'ProfileHeader.follow' })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: 'ProfileHeader.unfollow' })
		).not.toBeInTheDocument();
	});

	it('renders Follow for another public profile not currently followed', () => {
		renderHeader();

		expect(
			screen.getByRole('button', { name: 'ProfileHeader.follow' })
		).toBeInTheDocument();
	});

	it('renders Unfollow for another public profile currently followed', () => {
		renderHeader({ ...fullUser, isFollowing: true });

		expect(
			screen.getByRole('button', { name: 'ProfileHeader.unfollow' })
		).toBeInTheDocument();
	});

	it.each([
		'private',
		'followers_only',
	] as const)('does not render a follow control for an unrelated %s profile', (profileVisibility) => {
		renderHeader({ ...fullUser, profileVisibility });

		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it.each([
		'private',
		'followers_only',
	] as const)('renders Unfollow for a preserved relationship with a %s profile', (profileVisibility) => {
		renderHeader({
			...fullUser,
			profileVisibility,
			isFollowing: true,
		});

		expect(
			screen.getByRole('button', { name: 'ProfileHeader.unfollow' })
		).toBeInTheDocument();
	});
});
