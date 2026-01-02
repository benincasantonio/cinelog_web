import { X } from "lucide-react";
import { useEffect } from "react";
import type { MobileNavbarItem } from "../mobile-navbar-item.model";
import { Link } from "react-router-dom";

interface MobileNavbarProps {
  isOpen: boolean;
  closeOnEscape?: boolean;
  items: MobileNavbarItem[];
  onClose?: () => void;
}

export const MobileNavbar = ({
  isOpen,
  closeOnEscape = true,
  items,
  onClose,
}: MobileNavbarProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose?.();
      }
    };

    console.log("MobileNavbar useEffect triggered");
    if (closeOnEscape) {
      window.addEventListener("keydown", handleEscape);
      return () => {
        window.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, closeOnEscape, onClose]);

  return (
    <nav
      className={`fixed inset-0 h-screen w-screen transition-all duration-300 ease-out md:hidden z-40 ${
        isOpen
          ? "pointer-events-auto bg-white/70 opacity-100 backdrop-blur-sm dark:bg-black/70"
          : "pointer-events-none bg-white/0 opacity-0 backdrop-blur-none dark:bg-black/0"
      }`}
    >
      <div className="flex items-center justify-end p-4">
        <X
          className="cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-500"
          size={40}
          onClick={onClose}
        />
      </div>

      {/* Mobile navigation items can be added here */}
      <div className="flex flex-col items-center mt-8 gap-6">
        {items.map((item) =>
          item.visible !== false ? (
            <Link key={item.path} to={item.path} onClick={onClose}>
              {item.name}
            </Link>
          ) : null
        )}
      </div>
    </nav>
  );
};
