import { TabsTrigger } from "@antoniobenincasa/ui";
import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface ProfileTabProps {
  value: string;
  icon?: LucideIcon;
  children: ReactNode;
}

export const ProfileTab = ({
  value,
  icon: Icon,
  children,
}: ProfileTabProps) => {
  return (
    <TabsTrigger
      value={value}
      className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary dark:data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-primary dark:data-[state=active]:text-violet-400 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all px-0 py-4 font-medium text-sm shadow-none !bg-transparent -mb-[1px]"
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </TabsTrigger>
  );
};
