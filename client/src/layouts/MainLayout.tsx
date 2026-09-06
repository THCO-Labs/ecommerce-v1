import { Outlet } from "react-router-dom";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** Storefront shell. `router.tsx` mounts it as a layout route, so children arrive via <Outlet/>. */
export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
