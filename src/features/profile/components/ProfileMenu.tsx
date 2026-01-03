import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Film,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

interface ProfileMenuItem {
  label: string;
  icon: LucideIcon;
  path: string;
  end?: boolean;
}

interface ProfileMenuProps {
  handle: string;
}

export const ProfileMenu = ({ handle }: ProfileMenuProps) => {
  const menuItems: ProfileMenuItem[] = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      path: `/${handle}`,
      end: true,
    },
    {
      label: "Movies Watched",
      icon: Film,
      path: `/${handle}/movie-watched`,
    },
    {
      label: "Stats",
      icon: BarChart3,
      path: `/${handle}/stats`,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mt-6">
      <nav className="flex flex-col p-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
              ${
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
