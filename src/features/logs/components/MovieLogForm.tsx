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
import { MovieRatingField } from '@/features/movie/components/MovieRatingField';
import { getMovieRating } from '@/features/movie/repositories/movie-rating-repository';
import './MovieLogForm.css';
import { search } from '@/features/movie-search/repositories';
import { WATCHED_WHERE_VALUES } from '../models';
import { type LogFormSchema, logFormSchema } from '../schemas';
import { useMovieLogDialogStore } from '../stores';
import { useMovieLogStore } from '../stores/movieLogStore';

interface MovieLogFormProps {
	formId?: string;
	showSubmitButton?: boolean;
	onSuccess?: () => void;
}

export const MovieLogForm = ({
	formId,
	showSubmitButton = true,
	onSuccess,
}: MovieLogFormProps) => {
	const { t } = useTranslation();
	const prefilledMovie = useMovieLogDialogStore(
		(state) => state.prefilledMovie
	);
	const clearPrefilledMovie = useMovieLogDialogStore(
		(state) => state.clearPrefilledMovie
	);

	const createLog = useMovieLogStore((state) => state.createLog);
	const updateLog = useMovieLogStore((state) => state.updateLog);
	const isLoading = useMovieLogStore((state) => state.isLoading);
	const error = useMovieLogStore((state) => state.error);
	const clearError = useMovieLogStore((state) => state.clearError);

	const movieToEdit = useMovieLogDialogStore((state) => state.movieToEdit);

	const formValue = useMemo(
		() => ({
			tmdbId: movieToEdit?.tmdbId ?? prefilledMovie?.tmdbId ?? undefined,
			dateWatched: movieToEdit?.dateWatched ?? '',
			viewingNotes: movieToEdit?.viewingNotes ?? undefined,
			watchedWhere: movieToEdit?.watchedWhere ?? undefined,
			rating: movieToEdit?.movieRating ?? null,
		}),
		[movieToEdit, prefilledMovie]
	);

	const submitText = movieToEdit
		? t('MovieLogForm.submitUpdate')
		: t('MovieLogForm.submitCreate');

	const submittingText = movieToEdit
		? t('MovieLogForm.submittingUpdate')
		: t('MovieLogForm.submittingCreate');

	const form = useForm<LogFormSchema>({
		resolver: zodResolver(logFormSchema),
		values: formValue as LogFormSchema,
		mode: 'onBlur',
	});

	const tmdbId = form.watch('tmdbId');
	const selectedRating = form.watch('rating');
	const { setValue } = form;
	const [ratingRetry, setRatingRetry] = useState(0);
	const [ratingLookup, setRatingLookup] = useState<{
		tmdbId?: number;
		rating: number | null;
		status: 'loading' | 'ready' | 'error';
	}>({ rating: null, status: 'loading' });
	const ratingReady =
		!!movieToEdit ||
		(ratingLookup.tmdbId === tmdbId && ratingLookup.status === 'ready');
	const ratingLoading =
		!movieToEdit &&
		!!tmdbId &&
		(ratingLookup.tmdbId !== tmdbId || ratingLookup.status === 'loading');
	const ratingFailed =
		!movieToEdit &&
		ratingLookup.tmdbId === tmdbId &&
		ratingLookup.status === 'error';
	const initialRating = movieToEdit
		? (movieToEdit.movieRating ?? null)
		: ratingLookup.rating;

	// biome-ignore lint/correctness/useExhaustiveDependencies: Retry explicitly starts a new lookup for the same movie.
	useEffect(() => {
		if (movieToEdit) return;
		let active = true;
		setValue('rating', null);
		setRatingLookup({ tmdbId, rating: null, status: 'loading' });
		if (tmdbId) {
			getMovieRating(tmdbId).then(
				(result) => {
					if (!active) return;
					const rating = result?.rating ?? null;
					setValue('rating', rating);
					setRatingLookup({ tmdbId, rating, status: 'ready' });
				},
				() => {
					if (active)
						setRatingLookup({ tmdbId, rating: null, status: 'error' });
				}
			);
		}
		return () => {
			active = false;
		};
	}, [tmdbId, movieToEdit, ratingRetry, setValue]);

	const [searchItems, setSearchItems] = useState<
		Array<{ label: string; value: string }>
	>([]);

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
		if (!value) {
			setSearchItems([]);
			return;
		}

		const results = await search(value);

		const items = results.results.map((movie) => ({
			label: movie.title,
			value: movie.id.toString(),
		}));

		setSearchItems(items);
	};

	const onValueChange = (value: string) => {
		if (!value) {
			form.setValue('tmdbId', 0);
			return;
		}

		form.setValue('tmdbId', parseInt(value, 10));
	};

	const handleSubmit = async (data: LogFormSchema) => {
		clearError();
		const { rating, ...logData } = data;
		const ratingChange =
			ratingReady && rating != null && rating !== initialRating
				? { rating }
				: {};
		try {
			if (movieToEdit) {
				await updateLog(movieToEdit.id, {
					dateWatched: data.dateWatched,
					watchedWhere: data.watchedWhere,
					viewingNotes: data.viewingNotes,
					...ratingChange,
				});
			} else {
				await createLog({ ...logData, ...ratingChange });
			}

			form.reset();
			clearPrefilledMovie();
			onSuccess?.();
		} catch {
			// Error is already set in the store
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
							<FormLabel>{t('MovieLogForm.movieLabel')}</FormLabel>
							<FormControl>
								{movieToEdit ? (
									<Input readOnly value={movieToEdit.movie?.title ?? ''} />
								) : (
									<Autocomplete
										value={field.value?.toString() ?? ''}
										items={searchItems}
										onFilterChange={onFilterChange}
										onValueChange={onValueChange}
									/>
								)}
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
							<FormLabel>{t('MovieLogForm.dateWatchedLabel')}</FormLabel>
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
							<FormLabel>{t('MovieLogForm.watchedWhereLabel')}</FormLabel>
							<FormControl>
								<Select
									value={field.value ?? ''}
									onValueChange={(value) => field.onChange(value)}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={t('MovieLogForm.watchedWherePlaceholder')}
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
					name="rating"
					render={({ field }) => (
						<FormItem>
							<div aria-busy={ratingLoading}>
								<MovieRatingField
									value={field.value}
									onChange={field.onChange}
									label={t('MovieLogForm.ratingLabel')}
									description={t('MovieLogForm.ratingHint')}
									error={form.formState.errors.rating?.message}
									disabled={!tmdbId || !ratingReady || isLoading}
								>
									{ratingLoading && (
										<div className="movie-log-rating-skeleton">
											<div
												className="movie-log-rating-skeleton-row"
												aria-hidden="true"
											>
												{Array.from({ length: 10 }, (_, index) => (
													<span
														className="movie-log-rating-skeleton-star"
														key={index}
													/>
												))}
											</div>
											<p role="status">{t('MovieLogForm.ratingLoading')}</p>
										</div>
									)}
								</MovieRatingField>
							</div>
							{ratingFailed && (
								<div>
									<p role="alert" className="text-sm text-destructive">
										{t('MovieLogForm.ratingLoadError')}
									</p>
									<Button
										type="button"
										variant="ghost"
										disabled={isLoading}
										onClick={() => setRatingRetry((value) => value + 1)}
									>
										{t('MovieLogForm.retryRating')}
									</Button>
								</div>
							)}
							{ratingReady &&
								selectedRating != null &&
								selectedRating !== initialRating && (
									<Button
										type="button"
										variant="ghost"
										disabled={isLoading}
										onClick={() => field.onChange(initialRating)}
									>
										{t('MovieLogForm.resetRating')}
									</Button>
								)}
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="viewingNotes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('MovieLogForm.viewingNotesLabel')}</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									value={field.value ?? ''}
									placeholder={t('MovieLogForm.viewingNotesPlaceholder')}
									rows={4}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{showSubmitButton && (
					<Button type="submit" disabled={isLoading}>
						{isLoading ? submittingText : submitText}
					</Button>
				)}
			</form>
		</Form>
	);
};
