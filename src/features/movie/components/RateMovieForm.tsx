import { Controller, useForm } from "react-hook-form";
import { useMovieRatingStore } from "../store/useMovieRatingStore";
import { RateMovie } from "./RateMovie";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Spinner, Textarea } from "@antoniobenincasa/ui";
import type { MovieRatingResponse } from "../models";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type RateMovieFormData = {
  rating: number;
  comment?: string;
};

type RateMovieFormProps = {
  onSuccess?: (movieRating: MovieRatingResponse) => void;
  onCancel?: () => void;
};

export const RateMovieForm = ({ onSuccess, onCancel }: RateMovieFormProps) => {
  const { t } = useTranslation();
  const submitRating = useMovieRatingStore((state) => state.submitRating);
  const isLoading = useMovieRatingStore((state) => state.isLoading);
  const movieRating = useMovieRatingStore((state) => state.movieRating);

  const rateMovieSchema = z.object({
    rating: z.number().min(1, t("RateMovieForm.validation.rating")),
    comment: z.string().optional(),
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<RateMovieFormData>({
    resolver: zodResolver(rateMovieSchema),
    defaultValues: {
      rating: movieRating?.rating || 0,
      comment: movieRating?.comment || undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (movieRating) {
      reset({
        rating: movieRating.rating,
        comment: movieRating.comment || undefined,
      });
    }
  }, [movieRating, reset]);

  const onSubmit = async (data: RateMovieFormData) => {
    const movieRating = await submitRating(data.rating, data.comment);
    if (movieRating) {
      onSuccess?.(movieRating);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("RateMovieForm.yourRating")}
        </label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <RateMovie rating={field.value} onChangeRating={field.onChange} />
          )}
        />
        {errors.rating && (
          <span className="text-sm text-red-500">{errors.rating.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="comment"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("RateMovieForm.reviewOptional")}
        </label>
        <Textarea
          id="comment"
          rows={4}
          className="resize-none"
          placeholder={t("RateMovieForm.commentPlaceholder")}
          {...register("comment")}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          disabled={isLoading}
          onClick={onCancel}
        >
          {t("RateMovieForm.cancel")}
        </Button>
        <Button type="submit" disabled={!isValid || isLoading}>
          {isLoading ? <Spinner /> : t("RateMovieForm.save")}
        </Button>
      </div>
    </form>
  );
};
