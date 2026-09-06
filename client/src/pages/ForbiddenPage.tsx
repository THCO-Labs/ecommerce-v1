import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/app-config";

/**
 * Shown to someone who is signed in but lacks the role — a staff member who
 * reached an admin screen, say. Deliberately distinct from the login page:
 * asking them to sign in again would be misleading, because they already have.
 */
export default function ForbiddenPage() {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-12 text-center">
      <div>
        <ShieldAlert className="text-muted-foreground mx-auto size-12" aria-hidden="true" />
        <p className="text-primary mt-6 text-sm font-semibold">403</p>
        <h1 className="mt-3 text-4xl font-bold">Not your department</h1>
        <p className="text-muted-foreground mt-3">
          Your account does not have permission for that screen. If you think it should, ask an administrator.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to={routes.home}>Back to the shop</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={routes.dashboard.root}>Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
