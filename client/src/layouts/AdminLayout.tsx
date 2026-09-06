import { Outlet } from "react-router-dom";
import { DashboardNav } from "@/components/dashboard-nav";
import { siteChrome } from "@/config/app-config";

/** Presentation only — the role check lives in the router's `RequireStaff` wrapper. */
export function AdminLayout() {
  return (
    <div className="bg-muted/20 flex min-h-screen">
      <DashboardNav />
      <main className="min-w-0 flex-1">
        <header className="bg-background flex h-16 items-center border-b px-6">
          <p className="font-medium">{siteChrome.dashboard.workspaceLabel}</p>
        </header>
        <div className="p-5 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
