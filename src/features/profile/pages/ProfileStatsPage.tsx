import { useTranslation } from "react-i18next";

export const ProfileStatsPage = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
      <p className="text-lg font-medium">{t("ProfileStatsPage.comingSoon")}</p>
    </div>
  );
};

export default ProfileStatsPage;