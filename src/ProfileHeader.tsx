import { User } from 'lucide-react';
import type { UserResponse } from '@/features/auth/models/user-response';

interface ProfileHeaderProps {
	userInfo: UserResponse | null;
}

export const ProfileHeader = ({ userInfo }: ProfileHeaderProps) => {
	return (
		<>
			{/* Header Banner */}
			<div className="w-full h-48 bg-gradient-to-r from-text-primary to-purple-600" />

			{/* Profile Info Section */}
			<div className="px-4 pb-4 border-b border-gray-300 dark:border-gray-700">
				{/* Profile Icon - positioned to overlap banner */}
				<div className="relative">
					<div className="w-32 h-32 rounded-full bg-primary border-4 border-white dark:border-gray-900 flex items-center justify-center text-white -mt-16 mb-4">
						<User className="w-16 h-16" />
					</div>
				</div>

				{/* User Info */}
				<div className="mt-2 mb-4">
					<h1 className="text-2xl font-bold text-black dark:text-white">
						{userInfo?.firstName} {userInfo?.lastName}
					</h1>
					{userInfo?.handle && (
						<p className="text-gray-500 dark:text-gray-400 font-medium">
							@{userInfo.handle}
						</p>
					)}
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						{userInfo?.bio || 'No bio available.'}
					</p>
				</div>
			</div>
		</>
	);
};
