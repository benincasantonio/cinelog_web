import { useAuthStore } from "@/features/auth/stores";
import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const LoginPage = lazy(() => import("@features/auth/pages/LoginPage"));
const RegistrationPage = lazy(
  () => import("@features/auth/pages/RegistrationPage")
);
const HomePage = lazy(() => import("@features/home/pages/HomePage"));

export const AppRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <div />;
  }

  return (
    <Routes>
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
      />
      {isAuthenticated ? (
        <>
          <Route path="/" element={<HomePage />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
        </>
      )}
    </Routes>
  );
};
