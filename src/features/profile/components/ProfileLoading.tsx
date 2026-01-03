import { Skeleton } from "@antoniobenincasa/ui";
import { ProfileLayout } from "./ProfileLayout";
import { MoviesWatchedLoading } from "@/features/movie/components/MoviesWatchedLoading";

export const ProfileLoading = () => {
  const SidebarSkeleton = (
    <div className="space-y-6">
      {/* Profile Header Skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <Skeleton className="w-24 h-24 rounded-full mb-4" />
          {/* Name */}
          <Skeleton className="h-6 w-32 mb-2" />
          {/* Handle */}
          <Skeleton className="h-4 w-24 mb-6" />
          {/* Bio lines */}
          <div className="w-full space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      </div>

      {/* Profile Menu Skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-2 shadow-sm mt-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );

  return (
    <ProfileLayout sidebar={SidebarSkeleton}>
      <MoviesWatchedLoading />
    </ProfileLayout>
  );
};
