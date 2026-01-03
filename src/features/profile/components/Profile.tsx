import { Outlet } from "react-router-dom";
import { ProfileHeader, ProfileLayout, ProfileMenu } from ".";
import type { UserResponse } from "@/features/auth/models/user-response";

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
