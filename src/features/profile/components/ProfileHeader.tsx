import { Button, useNotification } from '@antoniobenincasa/ui';
import { User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserProfileResponse } from '@/features/auth/models/user-profile-response';
import {
	followUser,
	unfollowUser,
} from '@/features/auth/repositories/user-repository';
import { extractApiError } from '@/lib/api/api-error';

interface ProfileHeaderProps {
	userInfo: UserProfileResponse | null;
	isOwnProfile: boolean;
	onFollowStatusChange: (isFollowing: boolean) => void;
}

const FOLLOW_ERROR_KEYS: Record<string, string> = {
	PROFILE_NOT_PUBLIC: 'ApiError.profileNotPublic',
	RATE_LIMIT_EXCEEDED: 'ApiError.rateLimitExceeded',
};

export const ProfileHeader = ({
	userInfo,
	isOwnProfile,
	onFollowStatusChange,
}: ProfileHeaderProps) => {
	const { t } = useTranslation();
	const { notify } = useNotification();
	const [isFollowPending, setIsFollowPending] = useState(false);

	const showFollowControl =
		userInfo !== null &&
		!isOwnProfile &&
		(userInfo.profileVisibility === 'public' || userInfo.isFollowing);

	const handleFollowToggle = async () => {
		if (!userInfo || isFollowPending) return;

		setIsFollowPending(true);

		try {
			const nextIsFollowing = !userInfo.isFollowing;
			if (nextIsFollowing) {
				await followUser(userInfo.handle);
			} else {
				await unfollowUser(userInfo.handle);
			}
			onFollowStatusChange(nextIsFollowing);
		} catch (error) {
			const apiError = await extractApiError(error);
			const messageKey =
				(apiError?.error_code_name &&
					FOLLOW_ERROR_KEYS[apiError.error_code_name]) ||
				'ProfileHeader.followError';
			notify({
				variant: 'danger',
				message: t(messageKey),
			});
		} finally {
			setIsFollowPending(false);
		}
	};

	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
			{/* Mini Banner/Header decoration */}
			<div className="h-24 bg-linear-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/5 dark:to-purple-500/5 relative">
				<div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-violet-400 via-transparent to-transparent"></div>
			</div>

			<div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center relative z-10">
				{/* Profile Avatar */}
				<div className="w-24 h-24 rounded-full bg-white dark:bg-gray-900 p-1 mb-3 shadow-md">
					<div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white overflow-hidden relative">
						<User className="w-10 h-10 relative z-10" />
						<div className="absolute inset-0 bg-linear-to-tr from-black/10 to-transparent"></div>
					</div>
				</div>

				{/* User Info */}
				<h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
					{userInfo?.firstName} {userInfo?.lastName}
				</h1>
				{userInfo?.handle && (
					<p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
						@{userInfo.handle}
					</p>
				)}

				{userInfo && (
					<dl className="flex items-center justify-center gap-8 mt-4">
						<div className="flex flex-col-reverse">
							<dt className="text-xs text-gray-500 dark:text-gray-400">
								{t('ProfileHeader.followers')}
							</dt>
							<dd className="text-base font-semibold text-gray-900 dark:text-white">
								{userInfo.followerCount}
							</dd>
						</div>
						<div className="flex flex-col-reverse">
							<dt className="text-xs text-gray-500 dark:text-gray-400">
								{t('ProfileHeader.following')}
							</dt>
							<dd className="text-base font-semibold text-gray-900 dark:text-white">
								{userInfo.followingCount}
							</dd>
						</div>
					</dl>
				)}

				{showFollowControl && (
					<Button
						type="button"
						variant={userInfo.isFollowing ? 'outline' : 'default'}
						className="w-full mt-4"
						disabled={isFollowPending}
						aria-busy={isFollowPending}
						onClick={handleFollowToggle}
					>
						{t(
							userInfo.isFollowing
								? 'ProfileHeader.unfollow'
								: 'ProfileHeader.follow'
						)}
					</Button>
				)}

				{/* Divider with subtle styling */}
				<div className="w-full h-px bg-linear-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent my-5" />

				{/* Bio Section */}
				<div className="text-left w-full">
					<h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
						{t('ProfileHeader.about')}
					</h2>
					<div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
						{userInfo?.bio || (
							<span className="italic opacity-60">
								{t('ProfileHeader.noBio')}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
