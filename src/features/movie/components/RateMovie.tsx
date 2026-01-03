import { Star } from "lucide-react";

export interface RateMovieProps {
  rating?: number;
  onChangeRating: (newRating: number) => void;
}

export const RateMovie = ({ rating, onChangeRating }: RateMovieProps) => {
  const ratingScale = 10;

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: ratingScale }, (_, index) => index + 1).map(
        (value) => (
          <Star
            key={value}
            className={`w-6 h-6 cursor-pointer ${
              value <= (rating ?? 0)
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            onClick={() => onChangeRating(value)}
          />
        )
      )}
    </div>
  );
};
