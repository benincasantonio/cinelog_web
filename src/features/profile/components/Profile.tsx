import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import type { UserProfileResponse } from '@/features/auth/models/user-profile-response';
import { ProfileHeader, ProfileLayout, ProfileMenu } from '.';

interface ProfileProps {
	userInfo: UserProfileResponse | null;
	isOwnProfile: boolean;
	isPrivate: boolean;
}

export const Profile = ({
	userInfo,
	isOwnProfile,
	isPrivate,
}: ProfileProps) => {
	const { t } = useTranslation();

	return (
		<ProfileLayout
			sidebar={
				<>
					<ProfileHeader userInfo={userInfo} />
					{userInfo?.handle && !isPrivate && (
						<ProfileMenu handle={userInfo.handle} isOwnProfile={isOwnProfile} />
					)}
				</>
			}
		>
			{isPrivate && !isOwnProfile ? (
				<div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
					<Lock className="w-12 h-12 mb-4 opacity-50" />
					<p className="text-lg font-medium">
						{t('ProfilePage.privateProfile')}
					</p>
				</div>
			) : (
				<Outlet />
			)}
		</ProfileLayout>
	);
};
