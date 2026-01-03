import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface MovieDetailsHeroProps {
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  tagline: string | null;
}

export const MovieDetailsHero = ({
  title,
  posterPath,
  backdropPath,
  releaseDate,
  tagline,
}: MovieDetailsHeroProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-gray-900 shrink-0">
      {backdropPath ? (
        <div
          className="w-full h-full bg-cover bg-center opacity-60"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${backdropPath})`,
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <span className="text-gray-400">
            {t("MovieDetailsHero.noBackdrop")}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors cursor-pointer"
      >
        {t("MovieDetailsHero.back")}
      </button>

      {/* Poster & Title Overlay */}
      <div className="absolute -bottom-16 left-4 right-4 flex items-end gap-4 md:left-8 md:right-8">
        <div className="w-32 h-48 md:w-48 md:h-72 shrink-0 rounded-lg shadow-xl overflow-hidden bg-gray-200 border-4 border-background">
          {posterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${posterPath}`}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
              <span className="text-xs text-gray-500">
                {t("MovieDetailsHero.noImage")}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 pb-2 md:pb-4 min-w-0">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white drop-shadow-md">
            {title}{" "}
            <span className="text-lg md:text-2xl font-normal text-gray-700 dark:text-gray-300">
              ({releaseDate?.split("-")[0]})
            </span>
          </h1>
          {tagline && (
            <p className="hidden md:block text-gray-600 dark:text-gray-300 italic mt-1 drop-shadow-sm">
              {tagline}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
