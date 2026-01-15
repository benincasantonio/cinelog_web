import { Outlet } from 'react-router-dom';
import type { UserResponse } from '@/features/auth/models/user-response';
import { ProfileHeader, ProfileLayout, ProfileMenu } from '.';

interface ProfileProps {
	userInfo: UserResponse | null;
}

export const Profile = ({ userInfo }: ProfileProps) => {
	return (
		<ProfileLayout
			sidebar={
				<>
					<ProfileHeader userInfo={userInfo} />
					{userInfo?.handle && <ProfileMenu handle={userInfo.handle} />}
				</>
			}
		>
			<Outlet />
		</ProfileLayout>
	);
};
