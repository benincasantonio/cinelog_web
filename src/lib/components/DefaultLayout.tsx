import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const DefaultLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
