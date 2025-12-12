import { Button } from "@antoniobenincasa/ui";
import { useAuthStore } from "@features/auth/stores";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Button variant="destructive" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default HomePage;
