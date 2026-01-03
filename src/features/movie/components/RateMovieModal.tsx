import React from "react";
import { useMovieRatingStore } from "../store/useMovieRatingStore";
import { RateMovieForm } from "./RateMovieForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@antoniobenincasa/ui";

export const RateMovieModal: React.FC = () => {
  const isOpen = useMovieRatingStore((state) => state.isOpen);
  const setIsOpen = useMovieRatingStore((state) => state.setIsOpen);

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
          <RateMovieForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};