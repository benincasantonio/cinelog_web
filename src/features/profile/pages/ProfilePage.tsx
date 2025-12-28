import { Profile, ProfileLoading } from "../components";
import { useAuthStore } from "@/features/auth/stores";

const ProfilePage = () => {
  const { userInfo, isUserInfoLoading } = useAuthStore();

  if (isUserInfoLoading) {
    return <ProfileLoading />;
  }

  return <Profile userInfo={userInfo} />;
};

export { ProfilePage };
export default ProfilePage;

