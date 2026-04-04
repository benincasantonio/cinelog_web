import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { MoviesWatched } from '@/features/movie/components/MoviesWatched';

const ProfileMoviesWatchedPage = () => {
	const { t } = useTranslation();
	const { handle } = useParams<{ handle: string }>();

	if (!handle) {
		return null;
	}

	return (
		<>
			<title>{t('ProfileMoviesWatchedPage.pageTitle')}</title>
			<MoviesWatched handle={handle} />
		</>
	);
};

export default ProfileMoviesWatchedPage;
