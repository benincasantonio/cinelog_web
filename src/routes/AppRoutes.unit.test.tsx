import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const authState = {
	authenticatedStatus: false as boolean | null,
	isInitialized: true,
};

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: (selector: (state: typeof authState) => unknown) =>
		selector(authState),
}));

vi.mock('@/lib/components', () => ({
	DefaultLayout: () => (
		<div data-testid="default-layout">
			<Outlet />
		</div>
	),
}));

import { AppRoutes } from './AppRoutes';

export const LocationProbe = () => {
	const location = useLocation();
	return <span data-testid="location">{location.pathname}</span>;
};

describe('AppRoutes', () => {
	it('renders a placeholder while auth is not initialized', () => {
		authState.isInitialized = false;
		authState.authenticatedStatus = null;

		const { container } = render(
			<MemoryRouter initialEntries={['/random']}>
				<AppRoutes />
			</MemoryRouter>
		);

		expect(container.firstChild).toBeInTheDocument();
		expect(screen.queryByTestId('default-layout')).not.toBeInTheDocument();
	});

	it('renders routes for unauthenticated users', () => {
		authState.isInitialized = true;
		authState.authenticatedStatus = false;

		render(
			<MemoryRouter initialEntries={['/random']}>
				<AppRoutes />
				<LocationProbe />
			</MemoryRouter>
		);

		expect(screen.getByTestId('default-layout')).toBeInTheDocument();
		expect(screen.getByTestId('location')).toHaveTextContent('/random');
	});

	it('redirects authenticated users to /', () => {
		authState.isInitialized = true;
		authState.authenticatedStatus = true;

		render(
			<MemoryRouter initialEntries={['/random']}>
				<AppRoutes />
				<LocationProbe />
			</MemoryRouter>
		);

		expect(screen.getByTestId('location')).toHaveTextContent('/');
	});
});
