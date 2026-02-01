import { useTranslation } from 'react-i18next';
import { MoviesWatched } from '@/features/movie/components/MoviesWatched';

const ProfileMoviesWatchedPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<title>{t('ProfileMoviesWatchedPage.pageTitle')}</title>
			<MoviesWatched />
		</>
	);
};

export default ProfileMoviesWatchedPage;
