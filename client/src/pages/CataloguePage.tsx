import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, productsApi } from "@/api/catalogue";
import { useAsync } from "@/hooks/use-async";
import { CatalogueProductCard } from "@/features/catalogue/CatalogueProductCard";
import { CategoryFilter } from "@/features/catalogue/CategoryFilter";

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(q);

  const { data: categories } = useAsync(() => categoriesApi.list(), []);
  // Search and filter live in the URL, so this re-runs whenever either moves —
  // and a filtered catalogue stays a page you can share or bookmark.
  const { data: products, loading, error } = useAsync(
    () => productsApi.list({ category, q: q || undefined }),
    [category, q],
  );

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (draft.trim()) next.set("q", draft.trim());
    else next.delete("q");
    setSearchParams(next);
  }

  return (
    <div data-builder-id="catalogue.results" className="container py-12">
      <h1 className="text-3xl font-semibold">{q ? `Results for “${q}”` : "All products"}</h1>
      <p className="text-muted-foreground mt-2">
        Every price includes what you pay at the door. Nothing is charged online.
      </p>

      <form onSubmit={submitSearch} className="mt-6 flex max-w-md gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Search products"
          aria-label="Search products"
        />
        <Button type="submit" variant="outline">
          <Search className="size-4" />
          <span className="sr-only sm:not-sr-only">Search</span>
        </Button>
      </form>

      {categories && categories.length > 0 && (
        <div className="mt-6">
          <CategoryFilter categories={categories} active={category} />
        </div>
      )}

      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive mt-8 rounded-lg border p-4">{error}</p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [0, 1, 2, 3, 4, 5, 6, 7].map((key) => <Skeleton key={key} className="h-72 rounded-xl" />)
          : products?.map((product) => <CatalogueProductCard key={product.id} product={product} />)}
      </div>

      {!loading && products?.length === 0 && (
        <p className="text-muted-foreground mt-10 text-center">
          Nothing matched. Try a different search or browse another category.
        </p>
      )}
    </div>
  );
}
