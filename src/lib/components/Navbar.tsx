import { Link, useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
  Button,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@antoniobenincasa/ui";
import { Search, LogOut, User, Moon, Sun } from "lucide-react";
import { useAuthStore } from "@features/auth/stores/useAuthStore";
import { useTheme } from "@/lib/hooks/useTheme";

export const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-2">
      {/* Left side - Logo and Navigation */}
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-xl font-bold text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          CineLog
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuLink asChild>
              <Link to="/" className={navigationMenuTriggerStyle()}>
                Home
              </Link>
            </NavigationMenuLink>
            {isAuthenticated && (
              <NavigationMenuLink asChild>
                <Link to="/search" className={navigationMenuTriggerStyle()}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Link>
              </NavigationMenuLink>
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
        {!isAuthenticated ? (
          <>
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/registration")}>Register</Button>
          </>
        ) : (
          <NavigationMenu className="relative">
            <NavigationMenuList>
              <NavigationMenuItem className="relative">
                <NavigationMenuTrigger className="h-auto p-0 hover:bg-transparent data-[state=open]:bg-transparent">
                  <div className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  <NavigationMenuLink asChild>
                    <div
                      className="flex-row justify-between cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
    </nav>
  );
};
