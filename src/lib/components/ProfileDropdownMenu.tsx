import { useAuthStore } from "@/features/auth/stores";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@antoniobenincasa/ui";
import { User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const ProfileDropdownMenu = () => {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const userInfo = useAuthStore((state) => state.userInfo);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link
            to={userInfo?.handle ? `/${userInfo.handle}` : "/profile"}
            className="flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
