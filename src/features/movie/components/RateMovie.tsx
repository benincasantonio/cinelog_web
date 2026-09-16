import { Star } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/lib/hooks';

export interface RateMovieProps {
	rating?: number;
	onChangeRating: (newRating: number) => void;
	label?: string;
	descriptionId?: string;
	disabled?: boolean;
}

export const RateMovie = ({
	rating,
	onChangeRating,
	label,
	descriptionId,
	disabled = false,
}: RateMovieProps) => {
	const ratingScale = 10;
	const groupName = useId();

	const [hoveredRating, setHoveredRating] = useState<number | null>(null);

	const isMobile = useIsMobile();

	const { t } = useTranslation();

	const displayValue = (!disabled ? hoveredRating : null) ?? rating ?? null;

	return (
		<fieldset
			className="flex min-w-0 flex-col items-center gap-2"
			aria-label={label ?? t('RateMovieForm.yourRating')}
			aria-describedby={descriptionId}
			disabled={disabled}
		>
			<div
				className="flex items-center gap-2"
				onMouseLeave={() => setHoveredRating(null)}
			>
				{Array.from({ length: ratingScale }, (_, index) => index + 1).map(
					(value) => (
						<label
							className="relative cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-violet-700 dark:has-[:focus-visible]:outline-violet-300"
							key={value}
							onMouseEnter={() => !disabled && setHoveredRating(value)}
						>
							<input
								className="sr-only"
								type="radio"
								name={groupName}
								value={value}
								checked={rating === value}
								onChange={() => onChangeRating(value)}
							/>
							<span className="sr-only">
								{t('RateMovie.optionLabel', { value })}
							</span>
							<Star
								aria-hidden="true"
								className={`cursor-pointer
                ${isMobile ? 'w-5 h-5' : 'w-8 h-8'} ${
									(
										!disabled && hoveredRating !== null
											? hoveredRating >= value
											: (rating ?? 0) >= value
									)
										? 'text-yellow-400'
										: 'text-gray-300 dark:text-gray-600'
								}`}
							/>
						</label>
					)
				)}
			</div>
			<p
				className={`text-sm ${!displayValue ? 'opacity-0' : ''}`}
				aria-live="polite"
			>
				{t('RateMovie.ratingLabel', { value: displayValue ?? 0 })}
			</p>
		</fieldset>
	);
};
