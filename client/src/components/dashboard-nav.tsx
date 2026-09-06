import { LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { appConfig, routes, siteChrome } from "@/config/app-config";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { visibleGroups } from "@/navigation/sidebar-items";

/**
 * The sidebar every dashboard screen renders. Links are filtered by role, so a
 * staff member never sees a Products link that the API would refuse anyway —
 * hiding it is courtesy, `requireRole` is the boundary.
 */
export function DashboardNav() {
  const path = useLocation().pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const groups = visibleGroups(user?.role);

  async function handleSignOut() {
    await logout();
    navigate(routes.home);
  }

  return (
    <aside
      data-builder-id="dashboard.navigation"
      className="bg-sidebar hidden w-64 shrink-0 border-r md:flex md:flex-col"
    >
      <Link to={routes.home} className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
        <BrandMark className="size-7" iconClassName="text-primary size-5" />
        {appConfig.name}
      </Link>

      <nav className="flex-1 space-y-6 p-3">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="text-muted-foreground px-3 text-xs font-medium tracking-wider uppercase">{group.label}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const active = path === item.href || (item.matchNested && path.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "hover:bg-sidebar-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="size-4" />
          {siteChrome.dashboard.signOut}
        </Button>
      </div>
    </aside>
  );
}
