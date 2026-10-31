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
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MovieRatingField } from '@/features/movie/components/MovieRatingField';
import { getMovieRating } from '@/features/movie/repositories/movie-rating-repository';
import { movieIdSchema } from '@/features/movie/schemas/movie-id.schema';
import './MovieLogForm.css';
import { createLatestRequestGuard } from '@/lib/utilities/latest-request-guard';
import { useLogMovieSelection } from '../hooks/useLogMovieSelection';
import { WATCHED_WHERE_VALUES } from '../models';
import { type LogFormSchema, logFormSchema } from '../schemas';
import { useMovieLogDialogStore } from '../stores';
import { useMovieLogStore } from '../stores/movieLogStore';

interface MovieLogFormProps {
	formId?: string;
	showSubmitButton?: boolean;
	onSuccess?: () => void;
	onReadyChange?: (ready: boolean) => void;
}

export const MovieLogForm = ({
	formId,
	showSubmitButton = true,
	onSuccess,
	onReadyChange,
}: MovieLogFormProps) => {
	const { t, i18n } = useTranslation();
	const sessionId = useMovieLogDialogStore((state) => state.sessionId);
	const triggerUpdate = useMovieLogDialogStore((state) => state.triggerUpdate);
	const saveGuard = useRef(createLatestRequestGuard()).current;
	// biome-ignore lint/correctness/useExhaustiveDependencies: Each dialog session owns its completion callback.
	useEffect(() => () => saveGuard.invalidate(), [saveGuard, sessionId]);
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
			movieId: movieToEdit?.movieId ?? prefilledMovie?.movieId ?? undefined,
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

	const movieId = form.watch('movieId');
	const identityReady = movieIdSchema.safeParse(movieId).success;
	useEffect(() => {
		onReadyChange?.(identityReady);
	}, [identityReady, onReadyChange]);
	const selectedRating = form.watch('rating');
	const { setValue } = form;
	const [ratingRetry, setRatingRetry] = useState(0);
	const [ratingLookup, setRatingLookup] = useState<{
		movieId?: string;
		rating: number | null;
		status: 'loading' | 'ready' | 'error';
	}>({ rating: null, status: 'loading' });
	const ratingReady =
		!!movieToEdit ||
		(ratingLookup.movieId === movieId && ratingLookup.status === 'ready');
	const ratingLoading =
		!movieToEdit &&
		!!movieId &&
		(ratingLookup.movieId !== movieId || ratingLookup.status === 'loading');
	const ratingFailed =
		!movieToEdit &&
		ratingLookup.movieId === movieId &&
		ratingLookup.status === 'error';
	const initialRating = movieToEdit
		? (movieToEdit.movieRating ?? null)
		: ratingLookup.rating;

	// biome-ignore lint/correctness/useExhaustiveDependencies: Retry explicitly starts a new lookup for the same movie.
	useEffect(() => {
		if (movieToEdit) return;
		let active = true;
		setValue('rating', null);
		setRatingLookup({ movieId, rating: null, status: 'loading' });
		if (movieId) {
			getMovieRating(movieId).then(
				(result) => {
					if (!active) return;
					const rating = result?.rating ?? null;
					setValue('rating', rating);
					setRatingLookup({ movieId, rating, status: 'ready' });
				},
				() => {
					if (active)
						setRatingLookup({ movieId, rating: null, status: 'error' });
				}
			);
		}
		return () => {
			active = false;
		};
	}, [movieId, movieToEdit, ratingRetry, setValue]);

	const selection = useLogMovieSelection(
		movieToEdit
			? { movieId: movieToEdit.movieId, title: movieToEdit.movie?.title ?? '' }
			: prefilledMovie,
		(id) => setValue('movieId', id),
		i18n?.resolvedLanguage ?? i18n?.language
	);

	const handleSubmit = async (data: LogFormSchema) => {
		if (selection.isResolving || !identityReady || isLoading) return;
		const requestId = saveGuard.start();
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

			triggerUpdate();
			if (saveGuard.isStale(requestId)) return;
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
					name="movieId"
					render={() => (
						<FormItem>
							<FormLabel>{t('MovieLogForm.movieLabel')}</FormLabel>
							<FormControl>
								{movieToEdit ? (
									<Input readOnly value={movieToEdit.movie?.title ?? ''} />
								) : (
									<Autocomplete
										value={selection.selectedKey}
										items={selection.items}
										onFilterChange={selection.filter}
										onValueChange={selection.select}
										isLoading={selection.isSearching || selection.isResolving}
										disabled={isLoading}
										placeholder={t('MovieSelection.choose')}
										filterPlaceholder={t('MovieSearchPage.searchPlaceholder')}
										emptyMessage={t(
											selection.hasMore
												? 'MovieSearchList.moreResults'
												: 'MovieSearchList.noMoviesFound'
										)}
									/>
								)}
							</FormControl>
							{selection.isResolving && (
								<p role="status">{t('MovieSelection.resolving')}</p>
							)}
							{selection.selectionError && (
								<div>
									<p role="alert">
										{t(`MovieSelection.${selection.selectionError}`)}
									</p>
									{selection.selectionError === 'temporary' && (
										<Button
											type="button"
											variant="outline"
											onClick={selection.retry}
										>
											{t('MovieSelection.retry')}
										</Button>
									)}
									{selection.selectionError === 'invalidReference' && (
										<Button
											type="button"
											variant="outline"
											onClick={selection.searchAgain}
										>
											{t('MovieSelection.searchAgain')}
										</Button>
									)}
								</div>
							)}
							{selection.searchError && (
								<div>
									<p role="alert">{t('MovieSearchList.loadError')}</p>
									<Button
										type="button"
										variant="outline"
										onClick={selection.searchAgain}
									>
										{t('MovieSelection.searchAgain')}
									</Button>
								</div>
							)}
							{!movieToEdit && selection.selectedKey && (
								<Button
									type="button"
									variant="ghost"
									disabled={isLoading}
									onClick={() => selection.select('')}
								>
									{t('MovieSelection.clear')}
								</Button>
							)}
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
									disabled={!movieId || !ratingReady || isLoading}
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
					<Button type="submit" disabled={isLoading || !identityReady}>
						{isLoading ? submittingText : submitText}
					</Button>
				)}
			</form>
		</Form>
	);
};
