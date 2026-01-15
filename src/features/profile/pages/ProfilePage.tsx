import { useAuthStore } from '@/features/auth/stores';
import { Profile, ProfileLoading } from '../components';

const ProfilePage = () => {
	const { userInfo, isUserInfoLoading } = useAuthStore();

	if (isUserInfoLoading) {
		return <ProfileLoading />;
	}

	return <Profile userInfo={userInfo} />;
};

export default ProfilePage;
