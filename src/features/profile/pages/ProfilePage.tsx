import { User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@antoniobenincasa/ui";
import { MoviesWatched } from "../components";

const ProfilePage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto border-x border-gray-300 dark:border-gray-700 min-h-screen">
      {/* Header Banner */}
      <div className="w-full h-48 bg-gradient-to-r from-violet-600 to-purple-600" />

      {/* Profile Info Section */}
      <div className="px-4 pb-4 border-b border-gray-300 dark:border-gray-700">
        {/* Profile Icon - positioned to overlap banner */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-violet-600 border-4 border-white dark:border-gray-900 flex items-center justify-center text-white -mt-16 mb-4">
            <User className="w-16 h-16" />
          </div>
        </div>

        {/* User Info */}
        <div className="mt-2 mb-4">
          <h1 className="text-2xl font-bold text-black  dark:text-white">
            User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>

      {/* Tabs Section */}
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
    </div>
  );
};

export { ProfilePage };
export default ProfilePage;
