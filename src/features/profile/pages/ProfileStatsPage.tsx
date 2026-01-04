import { useTranslation } from "react-i18next";
import { StatsView } from "@/features/stats";

export const ProfileStatsPage = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">
          {t("ProfileStatsPage.comingSoon")}
        </p>
      </div>
      <StatsView />
    </div>
  );
};

export default ProfileStatsPage;
