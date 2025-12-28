import { Tabs, TabsContent, TabsList } from "@antoniobenincasa/ui";
import { MoviesWatched } from "@/features/movie/components/MoviesWatched";
import { LayoutDashboard, Film, BarChart3 } from "lucide-react";
import { ProfileTab } from "./ProfileTab";

export const ProfileTabs = () => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b border-gray-200 dark:border-gray-800 bg-transparent h-auto p-0 gap-8 px-6">
        <ProfileTab value="overview" icon={LayoutDashboard}>
          Overview
        </ProfileTab>
        <ProfileTab value="movies" icon={Film}>
          Movies Watched
        </ProfileTab>
        <ProfileTab value="stats" icon={BarChart3}>
          Stats
        </ProfileTab>
      </TabsList>

      <TabsContent
        value="overview"
        className="mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">Coming soon</p>
        </div>
      </TabsContent>

      <TabsContent value="movies" className="mt-0">
        <MoviesWatched />
      </TabsContent>

      <TabsContent value="stats" className="mt-0">
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">Coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
