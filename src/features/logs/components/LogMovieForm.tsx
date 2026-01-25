import {
	Autocomplete,
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from '@antoniobenincasa/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { search } from '@/features/movie-search/repositories';
import { WATCHED_WHERE_VALUES } from '../models';
import { createLog, updateLog } from '../repositories';
import { type LogFormSchema, logFormSchema } from '../schemas';
import { useMovieLogDialogStore } from '../store';

interface LogMovieFormProps {
	formId?: string;
  showSubmitButton?: boolean;
  onMovieLogCreated?: () => void;
	onMovieLogUpdated?: () => void;
}

export const LogMovieForm = ({
	formId,
  showSubmitButton = true,
	onMovieLogCreated,
	onMovieLogUpdated
}: LogMovieFormProps) => {
	const { t } = useTranslation();
	const prefilledMovie = useMovieLogDialogStore(
		(state) => state.prefilledMovie
	);
	const clearPrefilledMovie = useMovieLogDialogStore(
		(state) => state.clearPrefilledMovie
	);

	const movieToEdit = useMovieLogDialogStore((state) => state.movieToEdit);

	const formValue = useMemo(
		() => ({
			tmdbId: movieToEdit?.tmdbId ?? prefilledMovie?.tmdbId ?? undefined,
			dateWatched: movieToEdit?.dateWatched ?? '',
			viewingNotes: movieToEdit?.viewingNotes ?? undefined,
			watchedWhere: movieToEdit?.watchedWhere ?? undefined,
		}),
		[movieToEdit, prefilledMovie]
	);

	const form = useForm<LogFormSchema>({
		resolver: zodResolver(logFormSchema),
		values: formValue as LogFormSchema,
		mode: 'onBlur',
	});

	const [searchItems, setSearchItems] = useState<
		Array<{ label: string; value: string }>
	>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!movieToEdit && !prefilledMovie) {
			return;
		}
		const label = movieToEdit?.movie?.title ?? prefilledMovie?.title;
		const value =
			movieToEdit?.tmdbId?.toString() ?? prefilledMovie?.tmdbId?.toString();

		setSearchItems([
			{
				label: label ?? '',
				value: value ?? '',
			},
		]);
	}, [movieToEdit, prefilledMovie]);

	const onFilterChange = async (value: string) => {
		const results = await search(value);

		const items = results.results.map((movie) => ({
			label: movie.title,
			value: movie.id.toString(),
		}));

		setSearchItems(items);
	};

	const onValueChange = (value: string) => {
		console.log(value);
		if (!value) {
			form.setValue('tmdbId', 0);
			return;
		}

		form.setValue('tmdbId', parseInt(value, 10));
	};

	const updateMovieLog = async (data: LogFormSchema) => {
		setLoading(true);
		setError(null);

		try {
			await updateLog(movieToEdit!.id, {
				dateWatched: data.dateWatched,
				viewingNotes: data.viewingNotes ?? null,
				watchedWhere: data.watchedWhere ?? null,
			});

			// Reset form on success
			form.reset();
      clearPrefilledMovie();

      onMovieLogUpdated?.();
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError(t('LogMovieForm.error'));
			}
		} finally {
			setLoading(false);
		}
  };

	const createMovieLog = async (data: LogFormSchema) => {
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

      onMovieLogCreated?.();
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError(t('LogMovieForm.error'));
			}
		} finally {
			setLoading(false);
		}
	};

  const handleSubmit = async (data: LogFormSchema) => {
    if (!!movieToEdit) {
      await updateMovieLog(data);
    } else {
      await createMovieLog(data);
    }
  };

	return (
		<Form {...form}>
			<form
				id={formId}
				onSubmit={form.handleSubmit(handleSubmit)}
				className="flex flex-col gap-3"
			>
				{error && <div className="text-red-500 text-sm">{error}</div>}
				<FormField
					control={form.control}
					name="tmdbId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('LogMovieForm.movieLabel')}</FormLabel>
							<FormControl>
								<Autocomplete
									value={field.value?.toString() ?? ''}
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
							<FormLabel>{t('LogMovieForm.dateWatchedLabel')}</FormLabel>
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
							<FormLabel>{t('LogMovieForm.watchedWhereLabel')}</FormLabel>
							<FormControl>
								<Select
									value={field.value ?? ''}
									onValueChange={(value) => field.onChange(value)}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={t('LogMovieForm.watchedWherePlaceholder')}
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
							<FormLabel>{t('LogMovieForm.viewingNotesLabel')}</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									value={field.value ?? ''}
									placeholder={t('LogMovieForm.viewingNotesPlaceholder')}
									rows={4}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{showSubmitButton && (
					<Button type="submit" disabled={loading}>
						{loading ? t('LogMovieForm.submitting') : t('LogMovieForm.submit')}
					</Button>
				)}
			</form>
		</Form>
	);
};
