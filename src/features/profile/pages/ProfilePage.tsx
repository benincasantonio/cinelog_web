import { useCallback, useEffect, useState } from 'react';
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
		if (!handle || isUserInfoLoading) return;

		let isActive = true;

		setIsProfileLoading(true);
		setNotFound(false);
		setProfileData(null);
		getProfile(handle)
			.then((profile) => {
				if (isActive) {
					setProfileData(profile);
				}
			})
			.catch(async (err) => {
				const apiError = await extractApiError(err);
				if (!isActive) return;

				if (apiError?.error_code_name === 'USER_NOT_FOUND') {
					setNotFound(true);
				} else {
					setProfileData(null);
				}
			})
			.finally(() => {
				if (isActive) {
					setIsProfileLoading(false);
				}
			});

		return () => {
			isActive = false;
		};
	}, [handle, isUserInfoLoading]);

	const handleFollowStatusChange = useCallback((isFollowing: boolean) => {
		setProfileData((currentProfile) => {
			if (!currentProfile || currentProfile.isFollowing === isFollowing) {
				return currentProfile;
			}

			return {
				...currentProfile,
				followerCount: Math.max(
					0,
					currentProfile.followerCount + (isFollowing ? 1 : -1)
				),
				isFollowing,
			};
		});
	}, []);

	if (isUserInfoLoading || isProfileLoading) {
		return <ProfileLoading />;
	}

	if (!handle) {
		return null;
	}

	if (notFound) {
		return <ProfileNotFoundPage />;
	}

	if (!profileData) {
		return null;
	}

	return (
		<Profile
			userInfo={profileData}
			isOwnProfile={isOwnProfile}
			isPrivate={!isOwnProfile && profileData.profileVisibility !== 'public'}
			onFollowStatusChange={handleFollowStatusChange}
		/>
	);
};

export default ProfilePage;
