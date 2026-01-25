import { Link } from 'react-router-dom';

interface LogoProps {
	isAlpha?: boolean;
}

export const Logo = ({ isAlpha = false }: LogoProps) => {
	return (
		<Link
			to="/"
			className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-violet-400 transition-colors flex items-center gap-2"
		>
			CineLog
			{isAlpha && (
				<span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium">
					ALPHA
				</span>
			)}
		</Link>
	);
};
