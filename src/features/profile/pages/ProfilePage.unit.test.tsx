import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuthStore = vi.fn();

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: () => mockUseAuthStore(),
}));

vi.mock('../components', () => ({
	Profile: ({ userInfo }: { userInfo: unknown }) => (
		<div data-testid="profile">{JSON.stringify(userInfo)}</div>
	),
	ProfileLoading: () => <div data-testid="profile-loading">Loading</div>,
}));

import ProfilePage from './ProfilePage';

describe('ProfilePage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render ProfileLoading when user info is loading', () => {
		mockUseAuthStore.mockReturnValue({
			userInfo: null,
			isUserInfoLoading: true,
		});

		render(<ProfilePage />);

		expect(screen.getByTestId('profile-loading')).toBeInTheDocument();
		expect(screen.queryByTestId('profile')).not.toBeInTheDocument();
	});

	it('should render Profile when user info is loaded', () => {
		mockUseAuthStore.mockReturnValue({
			userInfo: { name: 'John' },
			isUserInfoLoading: false,
		});

		render(<ProfilePage />);

		expect(screen.getByTestId('profile')).toBeInTheDocument();
		expect(screen.queryByTestId('profile-loading')).not.toBeInTheDocument();
	});

	it('should pass userInfo to Profile component', () => {
		const userInfo = { name: 'John', email: 'john@test.com' };
		mockUseAuthStore.mockReturnValue({
			userInfo,
			isUserInfoLoading: false,
		});

		render(<ProfilePage />);

		expect(screen.getByTestId('profile')).toHaveTextContent(
			JSON.stringify(userInfo)
		);
	});
});
