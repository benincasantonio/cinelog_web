import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
	}: {
		userInfo: unknown;
		isOwnProfile: boolean;
		isPrivate: boolean;
	}) => (
		<div data-testid="profile">
			{JSON.stringify({ userInfo, isOwnProfile, isPrivate })}
		</div>
	),
	ProfileLoading: () => <div data-testid="profile-loading">Loading</div>,
}));

import ProfilePage from './ProfilePage';

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
		vi.clearAllMocks();
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

	it('renders own profile using auth store data', () => {
		mockUseAuthStore.mockReturnValue({
			userInfo: ownUserInfo,
			isUserInfoLoading: false,
		});

		renderWithRouter('neo');

		expect(screen.getByTestId('profile')).toBeInTheDocument();
		expect(screen.getByTestId('profile')).toHaveTextContent(
			JSON.stringify({
				userInfo: ownUserInfo,
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
			dateOfBirth: '1985-05-05',
			profileVisibility: 'public',
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
