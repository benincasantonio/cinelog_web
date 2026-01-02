import { useAuthStore } from "@/features/auth/stores";
import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DefaultLayout } from "@/lib/components";

const LoginPage = lazy(() => import("@features/auth/pages/LoginPage"));
const RegistrationPage = lazy(
  () => import("@features/auth/pages/RegistrationPage")
);
const HomePage = lazy(() => import("@features/home/pages/HomePage"));
const MovieSearchPage = lazy(
  () => import("@features/movie-search/pages/MovieSearchPage")
);
const MovieDetailsPage = lazy(
  () => import("@features/movie/pages/MovieDetailsPage")
);
const ProfilePage = lazy(() => import("@features/profile/pages/ProfilePage"));

export const AppRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <div />;
  }

  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
        />
        <Route path="/" id="home" element={<HomePage />} />

        {isAuthenticated ? (
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
            <Route path="/profile" id="profile" element={<ProfilePage />} />
          </>
        ) : (
          <>
            <Route path="/login" id="login" element={<LoginPage />} />
            <Route
              path="/registration"
              id="registration"
              element={<RegistrationPage />}
            />
          </>
        )}
      </Route>
    </Routes>
  );
};
