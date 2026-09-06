import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/app-config";

export default function NotFoundPage() {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-12 text-center">
      <div>
        <p className="text-primary text-sm font-semibold">404</p>
        <h1 className="mt-3 text-4xl font-bold">We could not find that page</h1>
        <p className="text-muted-foreground mt-3">
          The link may be out of date, or the product may have been taken off the shelves.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to={routes.home}>Back home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={routes.products}>Browse the shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
