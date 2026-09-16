import { Button, Spinner, Textarea } from '@antoniobenincasa/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { MovieRatingResponse } from '../models';
import { useMovieRatingStore } from '../stores/useMovieRatingStore';
import { MovieRatingField } from './MovieRatingField';

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
		rating: z.number().min(1, t('RateMovieForm.validation.rating')),
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
		mode: 'onChange',
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
				<Controller
					name="rating"
					control={control}
					render={({ field }) => (
						<MovieRatingField
							value={field.value}
							onChange={field.onChange}
							label={t('RateMovieForm.yourRating')}
							labelClassName="text-gray-700 dark:text-gray-300"
							error={errors.rating?.message}
						/>
					)}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<label
					htmlFor="comment"
					className="text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('RateMovieForm.reviewOptional')}
				</label>
				<Textarea
					id="comment"
					rows={4}
					className="resize-none"
					placeholder={t('RateMovieForm.commentPlaceholder')}
					{...register('comment')}
				/>
			</div>

			<div className="flex justify-end gap-3 pt-2">
				<Button
					type="button"
					variant="ghost"
					disabled={isLoading}
					onClick={onCancel}
				>
					{t('RateMovieForm.cancel')}
				</Button>
				<Button type="submit" disabled={!isValid || isLoading}>
					{isLoading ? <Spinner /> : t('RateMovieForm.save')}
				</Button>
			</div>
		</form>
	);
};
