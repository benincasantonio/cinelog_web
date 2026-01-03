import type { MovieRatingResponse } from "../models";
import { useMovieRatingStore } from "../store/useMovieRatingStore";
import { RateMovieForm } from "./RateMovieForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@antoniobenincasa/ui";

type RateMovieModalProps = {
  onSuccess?: (movieRating: MovieRatingResponse) => void;
};

export const RateMovieModal = ({ onSuccess }: RateMovieModalProps) => {
  const isOpen = useMovieRatingStore((state) => state.isOpen);
  const setIsOpen = useMovieRatingStore((state) => state.setIsOpen);

  const handleSuccess = (movieRating: MovieRatingResponse) => {
    setIsOpen(false);
    onSuccess?.(movieRating);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Movie</DialogTitle>
          <DialogDescription>
            Share your thoughts and rate this movie.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RateMovieForm
            onSuccess={handleSuccess}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
