import { Controller, useForm } from "react-hook-form";
import { useMovieRatingStore } from "../store/useMovieRatingStore";
import { RateMovie } from "./RateMovie";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Spinner, Textarea } from "@antoniobenincasa/ui";

const rateMovieSchema = z.object({
  rating: z.number().min(1, "Please select a rating"),
  comment: z.string().optional(),
});

type RateMovieFormData = z.infer<typeof rateMovieSchema>;

export const RateMovieForm = () => {
  const submitRating = useMovieRatingStore((state) => state.submitRating);
  const isLoading = useMovieRatingStore((state) => state.isLoading);
  const closeModal = useMovieRatingStore((state) => state.closeModal);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RateMovieFormData>({
    resolver: zodResolver(rateMovieSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: RateMovieFormData) => {
    await submitRating(data.rating, data.comment);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Your Rating
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
          Review (Optional)
        </label>
        <Textarea
          id="comment"
          rows={4}
          className="resize-none"
          placeholder="Write your thoughts about the movie..."
          {...register("comment")}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={closeModal}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || isLoading}>
          {isLoading ? <Spinner /> : "Save Rating"}
        </Button>
      </div>
    </form>
  );
};
