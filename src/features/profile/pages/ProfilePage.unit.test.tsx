import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './ProfilePage';

const mockUseAuthStore = vi.fn();
const mockGetProfile = vi.fn();
const mockExtractApiError = vi.fn();

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: () => mockUseAuthStore(),
}));

vi.mock('@/features/auth/repositories/user-repository', () => ({
	getProfile: (...args: unknown[]) => mockGetProfile(...args),
}));

vi.mock('@/lib/api/api-error', () => ({
	extractApiError: (...args: unknown[]) => mockExtractApiError(...args),
}));

vi.mock('../components', () => ({
	Profile: ({
		userInfo,
		isOwnProfile,
		isPrivate,
		onFollowStatusChange,
	}: {
		userInfo: {
			followerCount: number;
			isFollowing: boolean;
		} | null;
		isOwnProfile: boolean;
		isPrivate: boolean;
		onFollowStatusChange: (isFollowing: boolean) => void;
	}) => (
		<>
			<div data-testid="profile">
				{JSON.stringify({ userInfo, isOwnProfile, isPrivate })}
			</div>
			<button type="button" onClick={() => onFollowStatusChange(true)}>
				mark-following
			</button>
			<button type="button" onClick={() => onFollowStatusChange(false)}>
				mark-not-following
			</button>
		</>
	),
	ProfileLoading: () => <div data-testid="profile-loading">Loading</div>,
}));

function renderWithRouter(handle: string) {
	return render(
		<MemoryRouter initialEntries={[`/profile/${handle}`]}>
			<Routes>
				<Route path="/profile/:handle" element={<ProfilePage />} />
			</Routes>
		</MemoryRouter>
	);
}

describe('ProfilePage', () => {
	const ownUserInfo = {
		firstName: 'Neo',
		lastName: 'Anderson',
		email: 'neo@matrix.dev',
		handle: 'neo',
		dateOfBirth: '1990-01-01',
		profileVisibility: 'private' as const,
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders ProfileLoading when user info is loading', async () => {
		mockUseAuthStore.mockReturnValue({
			userInfo: null,
			isUserInfoLoading: true,
		});
		mockGetProfile.mockResolvedValueOnce({});

		await act(() => {
			renderWithRouter('neo');
		});

		expect(screen.getByTestId('profile-loading')).toBeInTheDocument();
		expect(screen.queryByTestId('profile')).not.toBeInTheDocument();
	});

	it('fetches and renders the own profile response with relationship counts', async () => {
		const ownProfile = {
			firstName: 'Neo',
			lastName: 'Anderson',
			handle: 'neo',
			dateOfBirth: '1990-01-01',
			profileVisibility: 'private' as const,
			followerCount: 7,
			followingCount: 5,
			isFollowing: false,
		};
		mockUseAuthStore.mockReturnValue({
			userInfo: ownUserInfo,
			isUserInfoLoading: false,
		});
		mockGetProfile.mockResolvedValueOnce(ownProfile);

		renderWithRouter('neo');

		await waitFor(() =>
			expect(screen.getByTestId('profile')).toBeInTheDocument()
		);

		expect(mockGetProfile).toHaveBeenCalledWith('neo');
		expect(screen.getByTestId('profile')).toHaveTextContent(
			JSON.stringify({
				userInfo: ownProfile,
				isOwnProfile: true,
				isPrivate: false,
			})
		);
	});

	it('fetches and renders other user profile', async () => {
		const otherProfile = {
			firstName: 'Morpheus',
			lastName: 'Leader',
			handle: 'morpheus',
			dateOfBirth: '',
			profileVisibility: 'public',
			followerCount: 2,
			followingCount: 4,
			isFollowing: false,
		};

		mockUseAuthStore.mockReturnValue({
			userInfo: ownUserInfo,
			isUserInfoLoading: false,
		});
		mockGetProfile.mockResolvedValueOnce(otherProfile);

		renderWithRouter('morpheus');

		await waitFor(() =>
			expect(screen.getByTestId('profile')).toBeInTheDocument()
		);

		expect(mockGetProfile).toHaveBeenCalledWith('morpheus');
		expect(screen.getByTestId('profile')).toHaveTextContent(
			JSON.stringify({
				userInfo: otherProfile,
				isOwnProfile: false,
				isPrivate: false,
			})
		);
	});

	it('fetches and renders other user private profile', async () => {
		const privateProfile = {
			firstName: 'Trinity',
			lastName: 'Hacker',
			handle: 'trinity',
			dateOfBirth: '1988-08-08',
			profileVisibility: 'private',
			followerCount: 3,
			followingCount: 1,
			isFollowing: false,
		};

		mockUseAuthStore.mockReturnValue({
			userInfo: ownUserInfo,
			isUserInfoLoading: false,
		});
		mockGetProfile.mockResolvedValueOnce(privateProfile);

		renderWithRouter('trinity');

		await waitFor(() =>
			expect(screen.getByTestId('profile')).toBeInTheDocument()
		);

		expect(screen.getByTestId('profile')).toHaveTextContent(
			JSON.stringify({
				userInfo: privateProfile,
				isOwnProfile: false,
				isPrivate: true,
			})
		);
	});

	it('keeps another user followers-only profile restricted', async () => {
		const followersOnlyProfile = {
			firstName: 'Oracle',
			lastName: 'Guide',
			handle: 'oracle',
			dateOfBirth: '',
			profileVisibility: 'followers_only',
			followerCount: 8,
			followingCount: 6,
			isFollowing: true,
		};

		mockUseAuthStore.mockReturnValue({
			userInfo: ownUserInfo,
			isUserInfoLoading: false,
		});
		mockGetProfile.mockResolvedValueOnce(followersOnlyProfile);

		renderWithRouter('oracle');

		await waitFor(() =>
			expect(screen.getByTestId('profile')).toBeInTheDocument()
		);

		expect(screen.getByTestId('profile')).toHaveTextContent(
			JSON.stringify({
				userInfo: followersOnlyProfile,
				isOwnProfile: false,
				isPrivate: true,
			})
		);
	});

	it('updates follower state and count exactly once per status transition', async () => {
		const otherProfile = {
			firstName: 'Morpheus',
			lastName: 'Leader',
			handle: 'morpheus',
			dateOfBirth: '',
			profileVisibility: 'public',
			followerCount: 2,
			followingCount: 4,
			isFollowing: false,
		};
		mockUseAuthStore.mockReturnValue({
			userInfo: ownUserInfo,
			isUserInfoLoading: false,
		});
		mockGetProfile.mockResolvedValueOnce(otherProfile);

		renderWithRouter('morpheus');

		await waitFor(() =>
			expect(screen.getByTestId('profile')).toHaveTextContent(
				'"followerCount":2'
			)
		);

		fireEvent.click(screen.getByRole('button', { name: 'mark-following' }));

		expect(screen.getByTestId('profile')).toHaveTextContent(
			'"followerCount":3'
		);
		expect(screen.getByTestId('profile')).toHaveTextContent(
			'"isFollowing":true'
		);

		fireEvent.click(screen.getByRole('button', { name: 'mark-following' }));
		expect(screen.getByTestId('profile')).toHaveTextContent(
			'"followerCount":3'
		);

		fireEvent.click(screen.getByRole('button', { name: 'mark-not-following' }));
		expect(screen.getByTestId('profile')).toHaveTextContent(
			'"followerCount":2'
		);
		expect(screen.getByTestId('profile')).toHaveTextContent(
			'"isFollowing":false'
		);
	});

	it('renders nothing when profile fetch fails with non-USER_NOT_FOUND error', async () => {
		mockUseAuthStore.mockReturnValue({
			userInfo: ownUserInfo,
			isUserInfoLoading: false,
		});
		mockGetProfile.mockRejectedValueOnce(new Error('Server error'));
		mockExtractApiError.mockResolvedValueOnce(null);

		renderWithRouter('unknown');

		await waitFor(() => expect(mockGetProfile).toHaveBeenCalledWith('unknown'));

		expect(screen.queryByTestId('profile')).not.toBeInTheDocument();
		expect(screen.queryByTestId('profile-loading')).not.toBeInTheDocument();
		expect(
			screen.queryByText('ProfileNotFoundPage.title')
		).not.toBeInTheDocument();
	});

	it('renders ProfileNotFoundPage when API returns USER_NOT_FOUND', async () => {
		mockUseAuthStore.mockReturnValue({
			userInfo: ownUserInfo,
			isUserInfoLoading: false,
		});
		mockGetProfile.mockRejectedValueOnce(new Error('Not found'));
		mockExtractApiError.mockResolvedValueOnce({
			error_code_name: 'USER_NOT_FOUND',
			error_code: 404,
			error_message: 'User not found',
			error_description: 'User not found',
		});

		renderWithRouter('unknown');

		await waitFor(() =>
			expect(screen.getByText('ProfileNotFoundPage.title')).toBeInTheDocument()
		);

		expect(screen.queryByTestId('profile')).not.toBeInTheDocument();
		expect(screen.queryByTestId('profile-loading')).not.toBeInTheDocument();
	});

	it('renders nothing when API returns a different error code', async () => {
		mockUseAuthStore.mockReturnValue({
			userInfo: ownUserInfo,
			isUserInfoLoading: false,
		});
		mockGetProfile.mockRejectedValueOnce(new Error('Forbidden'));
		mockExtractApiError.mockResolvedValueOnce({
			error_code_name: 'SOME_OTHER_ERROR',
			error_code: 500,
			error_message: 'Internal error',
			error_description: 'Internal error',
		});

		renderWithRouter('unknown');

		await waitFor(() => expect(mockGetProfile).toHaveBeenCalledWith('unknown'));

		expect(screen.queryByTestId('profile')).not.toBeInTheDocument();
		expect(
			screen.queryByText('ProfileNotFoundPage.title')
		).not.toBeInTheDocument();
	});
});
