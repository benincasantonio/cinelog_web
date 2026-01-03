import { User } from "lucide-react";
import type { UserResponse } from "@/features/auth/models/user-response";
import { useTranslation } from "react-i18next";

interface ProfileHeaderProps {
  userInfo: UserResponse | null;
}

export const ProfileHeader = ({ userInfo }: ProfileHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Mini Banner/Header decoration */}
      <div className="h-24 bg-linear-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/5 dark:to-purple-500/5 relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-violet-400 via-transparent to-transparent"></div>
      </div>

      <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center relative z-10">
        {/* Profile Avatar */}
        <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-900 p-1 mb-3 shadow-md">
          <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white overflow-hidden relative">
            <User className="w-10 h-10 relative z-10" />
            <div className="absolute inset-0 bg-linear-to-tr from-black/10 to-transparent"></div>
          </div>
        </div>

        {/* User Info */}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
          {userInfo?.firstName} {userInfo?.lastName}
        </h1>
        {userInfo?.handle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
            @{userInfo.handle}
          </p>
        )}

        {/* Divider with subtle styling */}
        <div className="w-full h-px bg-linear-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent my-5" />

        {/* Bio Section */}
        <div className="text-left w-full">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {t("ProfileHeader.about")}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {userInfo?.bio || (
              <span className="italic opacity-60">
                {t("ProfileHeader.noBio")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
