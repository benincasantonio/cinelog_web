import { MoviesWatched } from '@/features/movie/components/MoviesWatched';
import { useTranslation } from 'react-i18next';

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
