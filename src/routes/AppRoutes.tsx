import { Spinner } from '@antoniobenincasa/ui';
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores';
import { DefaultLayout } from '@/lib/components';

const ForgotPasswordPage = lazy(
	() => import('@/features/auth/pages/ForgotPasswordPage')
);
const ResetPasswordPage = lazy(
	() => import('@/features/auth/pages/ResetPasswordPage')
);
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegistrationPage = lazy(
	() => import('@/features/auth/pages/RegistrationPage')
);
const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const MovieSearchPage = lazy(
	() => import('@/features/movie-search/pages/MovieSearchPage')
);
const MovieDetailsPage = lazy(
	() => import('@/features/movie/pages/MovieDetailsPage')
);
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));

const ProfileOverviewPage = lazy(
	() => import('@/features/profile/pages/ProfileOverviewPage')
);
const ProfileMoviesWatchedPage = lazy(
	() => import('@/features/profile/pages/ProfileMoviesWatchedPage')
);
const ProfileStatsPage = lazy(
	() => import('@/features/profile/pages/ProfileStatsPage')
);

export const AppRoutes = () => {
	const authenticatedStatus = useAuthStore(
		(state) => state.authenticatedStatus
	);
	const isInitialized = useAuthStore((state) => state.isInitialized);

	if (!isInitialized) {
		return (
			<div
				data-testid="auth-loading"
				className="flex min-h-screen items-center justify-center"
			>
				<Spinner className="size-10 text-primary" />
			</div>
		);
	}

	return (
		<Routes>
			<Route element={<DefaultLayout />}>
				<Route
					path="*"
					element={<Navigate to={authenticatedStatus ? '/' : '/login'} />}
				/>
				<Route path="/" id="home" element={<HomePage />} />

				{authenticatedStatus ? (
					<>
						<Route
							path="/search"
							id="movie-search"
							element={<MovieSearchPage />}
						/>
						<Route
							path="/movies/:tmdbId"
							id="movie-details"
							element={<MovieDetailsPage />}
						/>
						<Route path="/profile/:handle" element={<ProfilePage />}>
							<Route index element={<ProfileOverviewPage />} />
							<Route
								path="movie-watched"
								element={<ProfileMoviesWatchedPage />}
							/>
							<Route path="stats" element={<ProfileStatsPage />} />
						</Route>
					</>
				) : (
					<>
						<Route path="/login" id="login" element={<LoginPage />} />
						<Route
							path="/registration"
							id="registration"
							element={<RegistrationPage />}
						/>
						<Route
							path="/forgot-password"
							id="forgot-password"
							element={<ForgotPasswordPage />}
						/>
						<Route
							path="/reset-password"
							id="reset-password"
							element={<ResetPasswordPage />}
						/>
					</>
				)}
			</Route>
		</Routes>
	);
};
