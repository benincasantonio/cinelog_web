import { Tabs, TabsContent, TabsList, TabsTrigger } from "@antoniobenincasa/ui";
import { MoviesWatched } from "../../movie/components/MoviesWatched";

export const ProfileTabs = () => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b border-gray-300 dark:border-gray-700 bg-background h-auto p-0 gap-0">
        <TabsTrigger
          value="overview"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 dark:data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 dark:data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors px-6 py-4 font-semibold"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="movies"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 dark:data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 dark:data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors px-6 py-4 font-semibold"
        >
          Movies Watched
        </TabsTrigger>
        <TabsTrigger
          value="stats"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 dark:data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 dark:data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors px-6 py-4 font-semibold"
        >
          Stats
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0">
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
