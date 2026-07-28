import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockExtractApiError, mockFollowUser, mockNotify, mockUnfollowUser } =
	vi.hoisted(() => ({
		mockExtractApiError: vi.fn(),
		mockFollowUser: vi.fn(),
		mockNotify: vi.fn(),
		mockUnfollowUser: vi.fn(),
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
	useNotification: () => ({ notify: mockNotify }),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('lucide-react', () => ({
	User: () => <svg data-testid="user-icon" />,
}));

vi.mock('@/features/auth/repositories/user-repository', () => ({
	followUser: (...args: unknown[]) => mockFollowUser(...args),
	unfollowUser: (...args: unknown[]) => mockUnfollowUser(...args),
}));

vi.mock('@/lib/api/api-error', () => ({
	extractApiError: (...args: unknown[]) => mockExtractApiError(...args),
}));

import { ProfileHeader } from './ProfileHeader';

const profile = {
	firstName: 'John',
	lastName: 'Doe',
	handle: 'john doe',
	bio: 'Movie lover',
	profileVisibility: 'public' as const,
	dateOfBirth: '1990-01-01',
	followerCount: 12,
	followingCount: 8,
	isFollowing: false,
};

describe('ProfileHeader follow integration', () => {
	const onFollowStatusChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockFollowUser.mockResolvedValue(undefined);
		mockUnfollowUser.mockResolvedValue(undefined);
		mockExtractApiError.mockResolvedValue(null);
	});

	it('disables Follow while pending and reports success after the request resolves', async () => {
		let resolveFollow: (() => void) | undefined;
		mockFollowUser.mockReturnValue(
			new Promise<void>((resolve) => {
				resolveFollow = resolve;
			})
		);
		render(
			<ProfileHeader
				userInfo={profile}
				isOwnProfile={false}
				onFollowStatusChange={onFollowStatusChange}
			/>
		);

		const button = screen.getByRole('button', {
			name: 'ProfileHeader.follow',
		});
		fireEvent.click(button);

		expect(mockFollowUser).toHaveBeenCalledWith('john doe');
		expect(button).toBeDisabled();
		expect(button).toHaveAttribute('aria-busy', 'true');
		expect(onFollowStatusChange).not.toHaveBeenCalled();

		resolveFollow?.();

		await waitFor(() =>
			expect(onFollowStatusChange).toHaveBeenCalledWith(true)
		);
		expect(mockNotify).not.toHaveBeenCalled();
		expect(button).not.toBeDisabled();
	});

	it('unfollows a preserved non-public relationship', async () => {
		render(
			<ProfileHeader
				userInfo={{
					...profile,
					profileVisibility: 'private',
					isFollowing: true,
				}}
				isOwnProfile={false}
				onFollowStatusChange={onFollowStatusChange}
			/>
		);

		fireEvent.click(
			screen.getByRole('button', { name: 'ProfileHeader.unfollow' })
		);

		await waitFor(() =>
			expect(onFollowStatusChange).toHaveBeenCalledWith(false)
		);
		expect(mockUnfollowUser).toHaveBeenCalledWith('john doe');
		expect(mockNotify).not.toHaveBeenCalled();
	});

	it.each([
		['PROFILE_NOT_PUBLIC', 'ApiError.profileNotPublic'],
		['RATE_LIMIT_EXCEEDED', 'ApiError.rateLimitExceeded'],
		['UNEXPECTED_ERROR', 'ProfileHeader.followError'],
	])('preserves state and notifies when the API returns %s', async (errorCodeName, message) => {
		const error = new Error('Request failed');
		mockFollowUser.mockRejectedValueOnce(error);
		mockExtractApiError.mockResolvedValueOnce({
			error_code_name: errorCodeName,
		});
		render(
			<ProfileHeader
				userInfo={profile}
				isOwnProfile={false}
				onFollowStatusChange={onFollowStatusChange}
			/>
		);

		fireEvent.click(
			screen.getByRole('button', { name: 'ProfileHeader.follow' })
		);

		await waitFor(() =>
			expect(mockNotify).toHaveBeenCalledWith({
				variant: 'danger',
				message,
			})
		);
		expect(onFollowStatusChange).not.toHaveBeenCalled();
		expect(
			screen.getByRole('button', { name: 'ProfileHeader.follow' })
		).not.toBeDisabled();
	});
});
