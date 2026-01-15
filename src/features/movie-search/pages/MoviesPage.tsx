import { Input } from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { MovieSearchList } from '../components';

const MoviesPage = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col">
			<h1 className="text-2xl font-bold mb-4">{t('MoviesPage.title')}</h1>
			<Input
				placeholder={t('MovieSearchPage.searchPlaceholder')}
				className="mb-4"
			/>

			<MovieSearchList />
		</div>
	);
};

export default MoviesPage;
