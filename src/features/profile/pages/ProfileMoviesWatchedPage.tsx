import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores';
import { MoviesWatched } from '@/features/movie/components/MoviesWatched';

const ProfileMoviesWatchedPage = () => {
	const { t } = useTranslation();
	const { handle } = useParams<{ handle: string }>();
	const { userInfo } = useAuthStore();

	if (!handle) {
		return null;
	}

	const isOwnProfile = userInfo?.handle === handle;

	return (
		<>
			<title>{t('ProfileMoviesWatchedPage.pageTitle')}</title>
			<MoviesWatched handle={handle} isDropdownMenuVisible={isOwnProfile} />
		</>
	);
};

export default ProfileMoviesWatchedPage;
