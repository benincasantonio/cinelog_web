import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { UserProfileResponse } from '@/features/auth/models/user-profile-response';
import { getProfile } from '@/features/auth/repositories/user-repository';
import { useAuthStore } from '@/features/auth/stores';
import { extractApiError } from '@/lib/api/api-error';
import { Profile, ProfileLoading } from '../components';
import ProfileNotFoundPage from './ProfileNotFoundPage';

const ProfilePage = () => {
	const { handle } = useParams<{ handle: string }>();
	const { userInfo, isUserInfoLoading } = useAuthStore();
	const [profileData, setProfileData] = useState<UserProfileResponse | null>(
		null
	);
	const [isProfileLoading, setIsProfileLoading] = useState(false);
	const [notFound, setNotFound] = useState(false);

	const isOwnProfile = userInfo?.handle === handle;

	useEffect(() => {
		if (!handle || isOwnProfile) return;

		setIsProfileLoading(true);
		setNotFound(false);
		getProfile(handle)
			.then(setProfileData)
			.catch(async (err) => {
				const apiError = await extractApiError(err);
				if (apiError?.error_code_name === 'USER_NOT_FOUND') {
					setNotFound(true);
				} else {
					setProfileData(null);
				}
			})
			.finally(() => setIsProfileLoading(false));
	}, [handle, isOwnProfile]);

	if (isUserInfoLoading || isProfileLoading) {
		return <ProfileLoading />;
	}

	if (!handle) {
		return null;
	}

	if (notFound) {
		return <ProfileNotFoundPage />;
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
