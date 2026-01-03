import { Github } from "lucide-react";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 py-12">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t("HomePage.title")}
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
          {t("HomePage.subtitle")}
        </p>
        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
          {t("HomePage.tagline")}
        </p>

        <p className="text-gray-500 dark:text-gray-400 italic">
          {t("HomePage.italic")}
        </p>
      </div>

      <div className="mt-20 pt-12 border-t border-gray-100 dark:border-white/10 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-wider">
          {t("HomePage.contributeTitle")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
          {t("HomePage.contributeText")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://github.com/benincasantonio/cinelog_web"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-950! hover:opacity-90 transition-all font-medium shadow-sm hover:shadow-md"
          >
            <Github size={20} />
            {t("HomePage.frontend")}
          </a>
          <a
            href="https://github.com/benincasantonio/cinelog_server"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all font-medium shadow-sm"
          >
            <Github size={20} />
            {t("HomePage.backend")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
