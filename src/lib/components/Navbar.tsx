import { Link, useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
  Button,
} from "@antoniobenincasa/ui";
import { Moon, Sun } from "lucide-react";
import { useAuthStore } from "@features/auth/stores/useAuthStore";
import { useTheme } from "@/lib/hooks/useTheme";
import { useIsMobile } from "../hooks";
import { ProfileDropdownMenu } from "./ProfileDropdownMenu";
import {
  CreateMovieLogButton,
  CreateMovieLogDialog,
} from "@features/logs/components";

export const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navigationData: {
    label: string;
    path: string;
    visible?: boolean;
  }[] = [
    { label: "Home", path: "/" },
    {
      label: "Search",
      path: "/search",
      visible: isAuthenticated,
    },
  ];

  const isMobile = useIsMobile();

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-xl font-bold text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          CineLog
        </Link>

        <NavigationMenu viewport={isMobile}>
          <NavigationMenuList className="flex-wrap">
            {navigationData.map((item) =>
              item.visible !== false ? (
                <NavigationMenuLink asChild key={item.path}>
                  <Link to={item.path}>{item.label}</Link>
                </NavigationMenuLink>
              ) : null
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Right side - Auth buttons or User menu */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {isAuthenticated && <CreateMovieLogButton />}

        {!isAuthenticated ? (
          <>
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/registration")}>Register</Button>
          </>
        ) : (
          <>
            <ProfileDropdownMenu />
          </>
        )}
      </div>

      {isAuthenticated && <CreateMovieLogDialog />}
    </nav>
  );
};
