import { Star } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/lib/hooks';

export interface RateMovieProps {
	rating?: number;
	onChangeRating: (newRating: number) => void;
}

export const RateMovie = ({ rating, onChangeRating }: RateMovieProps) => {
	const ratingScale = 10;

	const [hoveredRating, setHoveredRating] = useState<number | null>(null);

	const isMobile = useIsMobile();

	return (
		<div
			className="flex items-center gap-2"
			onMouseLeave={() => setHoveredRating(null)}
		>
			{Array.from({ length: ratingScale }, (_, index) => index + 1).map(
				(value) => (
					<div
						className="relative cursor-pointer"
						key={value}
						onMouseEnter={() => setHoveredRating(value)}
					>
						<span className="sr-only">{`Rate ${value} star${
							value > 1 ? 's' : ''
						}`}</span>
						<Star
							className={`cursor-pointer
                ${isMobile ? 'w-5 h-5' : 'w-8 h-8'} ${
									(
										hoveredRating !== null
											? hoveredRating >= value
											: (rating ?? 0) >= value
									)
										? 'text-yellow-400'
										: 'text-gray-300 dark:text-gray-600'
								}`}
							onClick={() => onChangeRating(value)}
						/>
					</div>
				)
			)}
		</div>
	);
};
