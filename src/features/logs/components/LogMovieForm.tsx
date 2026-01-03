import {
  FormField,
  Input,
  Form,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  Button,
  Autocomplete,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@antoniobenincasa/ui";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { logFormSchema, type LogFormSchema } from "../schemas";
import { search } from "@/features/movie-search/repositories";
import { WATCHED_WHERE_VALUES } from "../models";
import { createLog } from "../repositories";
import { useTranslation } from "react-i18next";
import { useCreateMovieLogDialogStore } from "../store";

export const LogMovieForm = () => {
  const { t } = useTranslation();
  const prefilledMovie = useCreateMovieLogDialogStore(
    (state) => state.prefilledMovie
  );
  const clearPrefilledMovie = useCreateMovieLogDialogStore(
    (state) => state.clearPrefilledMovie
  );

  const form = useForm<LogFormSchema>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      tmdbId: undefined,
      dateWatched: "",
      viewingNotes: null,
      watchedWhere: null,
    },
    mode: "onBlur",
  });

  const [searchItems, setSearchItems] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill the form when a movie is provided
  useEffect(() => {
    if (prefilledMovie) {
      form.setValue("tmdbId", prefilledMovie.tmdbId);
      setSearchItems([
        {
          label: prefilledMovie.title,
          value: prefilledMovie.tmdbId.toString(),
        },
      ]);
    }
  }, [prefilledMovie, form]);

  const onFilterChange = async (value: string) => {
    const results = await search(value);

    const items = results.results.map((movie) => ({
      label: movie.title,
      value: movie.id.toString(),
    }));

    setSearchItems(items);
  };

  const onValueChange = (value: string) => {
    if (!value) {
      form.setValue("tmdbId", 0);
      return;
    }

    form.setValue("tmdbId", parseInt(value, 10));
  };

  const handleSubmit = async (data: LogFormSchema) => {
    setLoading(true);
    setError(null);

    try {
      await createLog({
        tmdbId: data.tmdbId,
        dateWatched: data.dateWatched,
        viewingNotes: data.viewingNotes ?? null,
        watchedWhere: data.watchedWhere ?? null,
      });

      // Reset form on success
      form.reset();
      clearPrefilledMovie();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("LogMovieForm.error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-3"
      >
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <FormField
          control={form.control}
          name="tmdbId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("LogMovieForm.movieLabel")}</FormLabel>
              <FormControl>
                <Autocomplete
                  value={field.value?.toString() ?? undefined}
                  items={searchItems}
                  onFilterChange={onFilterChange}
                  onValueChange={onValueChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateWatched"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("LogMovieForm.dateWatchedLabel")}</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="watchedWhere"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("LogMovieForm.watchedWhereLabel")}</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("LogMovieForm.watchedWherePlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {WATCHED_WHERE_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {t(`WatchedWhere.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="viewingNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("LogMovieForm.viewingNotesLabel")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("LogMovieForm.viewingNotesPlaceholder")}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="default" disabled={loading}>
          {loading ? t("LogMovieForm.submitting") : t("LogMovieForm.submit")}
        </Button>
      </form>
    </Form>
  );
};
