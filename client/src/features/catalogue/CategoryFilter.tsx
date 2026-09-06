import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/app-config";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  /** The slug currently filtered on, or undefined for "everything". */
  active?: string;
}

/**
 * Category filter as links rather than buttons, so a filtered catalogue is a
 * real URL a shopper can bookmark, share, or reach with the back button.
 */
export function CategoryFilter({ categories, active }: CategoryFilterProps) {
  return (
    <nav data-builder-id="catalogue.filter" aria-label="Product categories" className="flex flex-wrap gap-2">
      <Button asChild variant={active ? "outline" : "default"} size="sm">
        <Link to={routes.products}>All products</Link>
      </Button>
      {categories.map((category) => (
        <Button
          asChild
          key={category.id}
          size="sm"
          variant={active === category.slug ? "default" : "outline"}
          className={cn(active === category.slug && "pointer-events-none")}
        >
          <Link to={routes.category(category.slug)}>{category.name}</Link>
        </Button>
      ))}
    </nav>
  );
}
