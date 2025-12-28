import { Skeleton } from "@antoniobenincasa/ui";
import { ProfileLayout } from "./ProfileLayout";

export const ProfileLoading = () => {
  return (
    <ProfileLayout>
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      <div className="px-4 pb-4 border-b border-gray-300 dark:border-gray-700">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 border-4 border-white dark:border-gray-900 -mt-16 mb-4 animate-pulse" />
        </div>
        <div className="mt-2 mb-4 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </ProfileLayout>
  );
};
