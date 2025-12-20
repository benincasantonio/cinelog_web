import { Button } from "@antoniobenincasa/ui";
import { useAuthStore } from "@features/auth/stores";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {authStore.isAuthenticated && (
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      )}

      {!authStore.isAuthenticated && (
        <div className="flex gap-1">
          <Button onClick={() => navigate("/login")}>Login</Button>
          <Button onClick={() => navigate("/registration")}>Register</Button>
        </div>
      )}
    </>
  );
};

export default HomePage;
