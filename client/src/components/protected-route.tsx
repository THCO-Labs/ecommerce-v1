import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/app-config";
import { isAdmin, isStaff, useAuth } from "@/hooks/use-auth";

/**
 * Route guards.
 *
 * These are navigation aids only, never the security boundary: the session
 * cookie is httpOnly and every API route re-checks the role with
 * `requireRole`, so a customer who edits client state reaches an empty screen
 * and nothing more.
 */

/** Neutral placeholder while the first `/auth/me` is still in flight. */
function AuthPending() {
  return (
    <div className="container grid min-h-[60vh] place-items-center py-12">
      <Skeleton className="h-40 w-full max-w-md" />
    </div>
  );
}

/** Where an unauthenticated visitor is sent, keeping the page they wanted. */
function useLoginRedirect(): string {
  const location = useLocation();
  return `${routes.auth.login}?next=${encodeURIComponent(location.pathname + location.search)}`;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const loginRedirect = useLoginRedirect();

  // Redirecting before the session resolves would bounce a signed-in user to
  // the login screen on every page refresh.
  if (loading) return <AuthPending />;
  if (!user) return <Navigate to={loginRedirect} replace />;
  return <>{children}</>;
}

/** Staff and admin: the operational dashboard. */
export function RequireStaff({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const loginRedirect = useLoginRedirect();

  if (loading) return <AuthPending />;
  if (!user) return <Navigate to={loginRedirect} replace />;
  if (!isStaff(user)) return <Navigate to={routes.auth.forbidden} replace />;
  return <>{children}</>;
}

/**
 * Admin only: the catalogue and the team. A staff member who navigates here is
 * sent to the forbidden page rather than the login screen — they are signed in,
 * just not for this.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const loginRedirect = useLoginRedirect();

  if (loading) return <AuthPending />;
  if (!user) return <Navigate to={loginRedirect} replace />;
  if (!isAdmin(user)) return <Navigate to={routes.auth.forbidden} replace />;
  return <>{children}</>;
}
