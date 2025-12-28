import { ProfileHeader, ProfileLayout, ProfileTabs } from ".";
import type { UserResponse } from "@/features/auth/models/user-response";

interface ProfileProps {
  userInfo: UserResponse | null;
}

export const Profile = ({ userInfo }: ProfileProps) => {
  return (
    <ProfileLayout>
      <ProfileHeader userInfo={userInfo} />
      <ProfileTabs />
    </ProfileLayout>
  );
};
