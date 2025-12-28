import { MoviesWatched } from "@/features/movie/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@antoniobenincasa/ui";
import { LayoutDashboard, Film, BarChart3 } from "lucide-react";

export const ProfileTabs = () => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b border-gray-200 dark:border-gray-800 bg-transparent h-auto p-0 gap-8 px-6">
        <TabsTrigger
          value="overview"
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 dark:data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all px-0 py-4 font-medium text-sm shadow-none !bg-transparent -mb-[1px]"
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="movies"
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 dark:data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all px-0 py-4 font-medium text-sm shadow-none bg-transparent -mb-px"
        >
          <Film className="w-4 h-4" />
          Movies Watched
        </TabsTrigger>
        <TabsTrigger
          value="stats"
          className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 dark:data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all px-0 py-4 font-medium text-sm shadow-none !bg-transparent -mb-[1px]"
        >
          <BarChart3 className="w-4 h-4" />
          Stats
        </TabsTrigger>
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
