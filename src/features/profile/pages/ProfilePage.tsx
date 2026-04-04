import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { UserProfileResponse } from '@/features/auth/models/user-profile-response';
import { getProfile } from '@/features/auth/repositories/user-repository';
import { useAuthStore } from '@/features/auth/stores';
import { Profile, ProfileLoading } from '../components';

const ProfilePage = () => {
	const { handle } = useParams<{ handle: string }>();
	const { userInfo, isUserInfoLoading } = useAuthStore();
	const [profileData, setProfileData] = useState<UserProfileResponse | null>(
		null
	);
	const [isProfileLoading, setIsProfileLoading] = useState(false);

	const isOwnProfile = userInfo?.handle === handle;

	useEffect(() => {
		if (!handle || isOwnProfile) return;

		setIsProfileLoading(true);
		getProfile(handle)
			.then(setProfileData)
			.catch(() => setProfileData(null))
			.finally(() => setIsProfileLoading(false));
	}, [handle, isOwnProfile]);

	if (isUserInfoLoading || isProfileLoading) {
		return <ProfileLoading />;
	}

	if (!handle) {
		return null;
	}

	if (isOwnProfile) {
		return (
			<Profile userInfo={userInfo} isOwnProfile={true} isPrivate={false} />
		);
	}

	if (!profileData) {
		return null;
	}

	return (
		<Profile
			userInfo={profileData}
			isOwnProfile={false}
			isPrivate={profileData.profileVisibility !== 'public'}
		/>
	);
};

export default ProfilePage;
