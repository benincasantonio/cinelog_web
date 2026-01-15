import { Star } from 'lucide-react';
import type React from 'react';

interface MovieVoteProps {
	vote: number;
	source: 'user' | 'tmdb';
	className?: string;
	onClick?: () => void;
}

export const MovieVote: React.FC<MovieVoteProps> = ({
	vote,
	source,
	className = '',
	onClick,
}) => {
	if (vote <= 0) return null;

	const colorClass = source === 'user' ? 'text-primary' : 'text-amber-500';

	return (
		<div
			className={`flex items-center gap-1 font-semibold ${colorClass} ${className}`}
			onClick={onClick}
		>
			<Star className="w-4 h-4 fill-current" />
			<span>{vote.toFixed(1)}</span>
		</div>
	);
};
