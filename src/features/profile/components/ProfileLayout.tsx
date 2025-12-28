import { type ReactNode } from "react";

interface ProfileLayoutProps {
  children: ReactNode;
}

export const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto border-x border-gray-300 dark:border-gray-700 min-h-screen">
      {children}
    </div>
  );
};
