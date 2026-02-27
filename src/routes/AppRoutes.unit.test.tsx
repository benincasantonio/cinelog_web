import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { MemoryRouter, Outlet, useLocation } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';

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

vi.mock('@/features/auth/pages/ForgotPasswordPage', () => ({
	default: () => <div data-testid="forgot-password-page" />,
}));
vi.mock('@/features/auth/pages/ResetPasswordPage', () => ({
	default: () => <div data-testid="reset-password-page" />,
}));
vi.mock('@/features/auth/pages/LoginPage', () => ({
	default: () => <div data-testid="login-page" />,
}));
vi.mock('@/features/auth/pages/RegistrationPage', () => ({
	default: () => <div data-testid="registration-page" />,
}));
vi.mock('@/features/home/pages/HomePage', () => ({
	default: () => <div data-testid="home-page" />,
}));
vi.mock('@/features/movie-search/pages/MovieSearchPage', () => ({
	default: () => <div data-testid="movie-search-page" />,
}));
vi.mock('@/features/movie/pages/MovieDetailsPage', () => ({
	default: () => <div data-testid="movie-details-page" />,
}));
vi.mock('@/features/profile/pages/ProfilePage', () => ({
	default: () => <Outlet />,
}));
vi.mock('@/features/profile/pages/ProfileOverviewPage', () => ({
	default: () => <div data-testid="profile-overview-page" />,
}));
vi.mock('@/features/profile/pages/ProfileMoviesWatchedPage', () => ({
	default: () => <div data-testid="profile-movies-page" />,
}));
vi.mock('@/features/profile/pages/ProfileStatsPage', () => ({
	default: () => <div data-testid="profile-stats-page" />,
}));
vi.mock('@antoniobenincasa/ui', () => ({
	Spinner: () => <div data-testid="spinner" />,
}));

import { AppRoutes } from './AppRoutes';

export const LocationProbe = () => {
	const location = useLocation();
	return <span data-testid="location">{location.pathname}</span>;
};

describe('AppRoutes', () => {
	beforeAll(async () => {
		await Promise.all([
			import('@/features/auth/pages/ForgotPasswordPage'),
			import('@/features/auth/pages/ResetPasswordPage'),
			import('@/features/auth/pages/LoginPage'),
			import('@/features/auth/pages/RegistrationPage'),
			import('@/features/home/pages/HomePage'),
			import('@/features/movie-search/pages/MovieSearchPage'),
			import('@/features/movie/pages/MovieDetailsPage'),
			import('@/features/profile/pages/ProfilePage'),
			import('@/features/profile/pages/ProfileOverviewPage'),
			import('@/features/profile/pages/ProfileMoviesWatchedPage'),
			import('@/features/profile/pages/ProfileStatsPage'),
		]);
	});

	it('renders a spinner while auth is not initialized', () => {
		authState.isInitialized = false;
		authState.authenticatedStatus = null;

		render(
			<MemoryRouter initialEntries={['/random']}>
				<AppRoutes />
			</MemoryRouter>
		);

		expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
		expect(screen.getByTestId('spinner')).toBeInTheDocument();
		expect(screen.queryByTestId('default-layout')).not.toBeInTheDocument();
	});

	it('renders routes for unauthenticated users', () => {
		authState.isInitialized = true;
		authState.authenticatedStatus = false;

		render(
			<MemoryRouter initialEntries={['/random']}>
				<Suspense fallback={<div data-testid="loading" />}>
					<AppRoutes />
				</Suspense>
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
				<Suspense fallback={<div data-testid="loading" />}>
					<AppRoutes />
				</Suspense>
				<LocationProbe />
			</MemoryRouter>
		);

		expect(screen.getByTestId('location')).toHaveTextContent('/');
	});

	it('loads unauthenticated lazy pages', async () => {
		authState.isInitialized = true;
		authState.authenticatedStatus = false;

		const cases: Array<[string, string]> = [
			['/login', 'login-page'],
			['/registration', 'registration-page'],
			['/forgot-password', 'forgot-password-page'],
			['/reset-password', 'reset-password-page'],
		];

		const renders = cases.map(([entry]) =>
			render(
				<MemoryRouter initialEntries={[entry]}>
					<Suspense fallback={<div data-testid="loading" />}>
						<AppRoutes />
					</Suspense>
				</MemoryRouter>
			)
		);

		await Promise.all(
			cases.map(([, testId]) =>
				screen.findByTestId(testId, undefined, { timeout: 400 })
			)
		);

		renders.forEach(({ unmount }) => unmount());
	});

	it('loads authenticated lazy pages', async () => {
		authState.isInitialized = true;
		authState.authenticatedStatus = true;

		const cases: Array<[string, string]> = [
			['/search', 'movie-search-page'],
			['/movies/1', 'movie-details-page'],
			['/profile/neo', 'profile-overview-page'],
			['/profile/neo/movie-watched', 'profile-movies-page'],
			['/profile/neo/stats', 'profile-stats-page'],
		];

		const renders = cases.map(([entry]) =>
			render(
				<MemoryRouter initialEntries={[entry]}>
					<Suspense fallback={<div data-testid="loading" />}>
						<AppRoutes />
					</Suspense>
				</MemoryRouter>
			)
		);

		await Promise.all(
			cases.map(([, testId]) =>
				screen.findByTestId(testId, undefined, { timeout: 400 })
			)
		);

		renders.forEach(({ unmount }) => unmount());
	});
});
