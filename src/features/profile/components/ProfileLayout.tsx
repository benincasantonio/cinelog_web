import { type ReactNode } from "react";

interface ProfileLayoutProps {
  children: ReactNode;
  /**
   * The sidebar content (profile card, etc.).
   * On desktop, this is sticky on the left.
   * On mobile, this appears at the top.
   */
  sidebar?: ReactNode;
}

export const ProfileLayout = ({ children, sidebar }: ProfileLayoutProps) => {
  return (
    <div className="w-full mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-4 lg:p-6">
        {/* Sidebar Column */}
        {sidebar && (
          <aside className="lg:col-span-3 xl:col-span-3">
            <div className="lg:sticky lg:top-24">{sidebar}</div>
          </aside>
        )}

        {/* Main Content Column */}
        <main
          className={sidebar ? "lg:col-span-9 xl:col-span-9" : "lg:col-span-12"}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
