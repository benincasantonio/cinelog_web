import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUserInfo = {
	id: '1',
	firstName: 'Neo',
	lastName: 'Anderson',
	email: 'neo@matrix.com',
	handle: 'neo',
	dateOfBirth: '1990-01-01',
};

let currentMockUserInfo: typeof mockUserInfo | null = mockUserInfo;

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: (
		selector: (state: { userInfo: typeof mockUserInfo | null }) => unknown
	) => selector({ userInfo: currentMockUserInfo }),
}));

import { OwnerRoute } from './OwnerRoute';

function renderWithRouter(handle: string) {
	return render(
		<MemoryRouter initialEntries={[`/profile/${handle}/settings`]}>
			<Routes>
				<Route
					path="/profile/:handle/settings"
					element={
						<OwnerRoute>
							<div data-testid="protected-content" />
						</OwnerRoute>
					}
				/>
				<Route
					path="/profile/:handle"
					element={<div data-testid="profile-overview" />}
				/>
			</Routes>
		</MemoryRouter>
	);
}

describe('OwnerRoute', () => {
	beforeEach(() => {
		currentMockUserInfo = mockUserInfo;
	});

	it('should render children when handle matches logged-in user', () => {
		renderWithRouter('neo');

		expect(screen.getByTestId('protected-content')).toBeInTheDocument();
	});

	it('should redirect when handle does not match logged-in user', () => {
		renderWithRouter('morpheus');

		expect(screen.getByTestId('profile-overview')).toBeInTheDocument();
		expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
	});

	it('should redirect when user is not logged in', () => {
		currentMockUserInfo = null;
		renderWithRouter('neo');

		expect(screen.getByTestId('profile-overview')).toBeInTheDocument();
		expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
	});
});
