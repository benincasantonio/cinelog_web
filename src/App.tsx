import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { useEffect } from "react";
import { useAuthStore } from "./features/auth/stores/useAuthStore";
import { ThemeProvider } from "./lib/components/ThemeProvider";

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="cinelog-theme">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
