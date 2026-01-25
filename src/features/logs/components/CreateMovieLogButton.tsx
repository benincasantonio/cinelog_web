import { Button } from '@antoniobenincasa/ui';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMovieLogDialogStore } from '../store';

export const CreateMovieLogButton = () => {
	const { t } = useTranslation();
	const open = useMovieLogDialogStore((state) => state.open);

	const handleClick = () => {
		open();
	};

	return (
		<>
			<Button
				variant="default"
				className="bg-primary text-white hover:bg-violet-700 dark:hover:bg-violet-500 hidden md:inline-flex"
				onClick={handleClick}
			>
				{t('CreateMovieLogButton.logMovie')}
			</Button>

			<Plus
				className="
      w-6 h-6 text-primary dark:text-primary hover:text-primary dark:hover:text-primary transition-colors
      md:hidden
      cursor-pointer
    "
				onClick={handleClick}
			/>
		</>
	);
};
