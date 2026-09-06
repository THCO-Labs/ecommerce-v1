import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoneyCompact } from "@/components/price-display";
import { appConfig, routes, siteChrome } from "@/config/app-config";
import { categoriesApi, productsApi } from "@/api/catalogue";
import { useAsync } from "@/hooks/use-async";
import { FeaturedProductCard } from "@/features/home/FeaturedProductCard";
import { HeroCollage } from "@/features/home/HeroCollage";

/**
 * The landing page.
 *
 * Every string here comes from `site-content.json` via `siteChrome.home`, and
 * the delivery threshold is read from `appConfig` rather than typed into the
 * copy — a number written twice is a number that eventually disagrees with
 * itself and tells a customer something untrue.
 */
export default function HomePage() {
  const { data: featured, loading } = useAsync(() => productsApi.featured(), []);
  const { data: categories } = useAsync(() => categoriesApi.list(), []);
  const home = siteChrome.home;

  return (
    <>
      <section data-builder-id="homepage.hero" className="border-b">
        <div className="container grid gap-12 py-14 lg:grid-cols-12 lg:gap-16 lg:py-24">
          <div className="lg:col-span-6 lg:self-center">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
              {home.eyebrow}
            </p>

            <h1 className="mt-5 max-w-xl text-4xl leading-[1.06] font-medium tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
              {home.headline}
            </h1>

            <p className="text-muted-foreground mt-6 max-w-md text-lg leading-relaxed">
              {appConfig.description}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-sm px-6">
                <Link to={routes.products}>{home.primaryAction}</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-sm px-6">
                <Link to={routes.lookup}>{home.secondaryAction}</Link>
              </Button>
            </div>

            {/* Reassurance as a quiet strip rather than a row of icon cards. */}
            <dl className="mt-12 grid gap-x-8 gap-y-5 border-t pt-8 sm:grid-cols-3">
              {home.assurances.map((item) => (
                <div key={item.id}>
                  <dt className="text-sm font-medium">{item.title}</dt>
                  <dd className="text-muted-foreground mt-1.5 text-[13px] leading-relaxed">
                    {item.text.replace("{amount}", formatMoneyCompact(appConfig.freeDeliveryOver))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6">
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Skeleton className="mt-8 aspect-[4/5] rounded-sm sm:mt-14" />
                <Skeleton className="aspect-square rounded-sm" />
              </div>
            ) : (
              <HeroCollage products={featured ?? []} />
            )}
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="container py-16 lg:py-20">
          <SectionHeading title={home.categoriesHeading} lead={home.categoriesLead} />
          <div className="mt-8 grid gap-px overflow-hidden rounded-sm border sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={routes.category(category.slug)}
                className="bg-card hover:bg-secondary group -m-px border p-6 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-medium">{category.name}</h3>
                  <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
                {category.description && (
                  <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container pb-20 lg:pb-28">
        <SectionHeading
          title={home.featuredHeading}
          lead={home.featuredLead}
          action={
            <Button asChild variant="link" className="h-auto p-0">
              <Link to={routes.products}>
                {home.featuredAction} <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />

        <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-72 rounded-sm" />)
            : featured?.map((product) => <FeaturedProductCard key={product.id} product={product} />)}
        </div>

        {!loading && featured?.length === 0 && (
          <p className="text-muted-foreground border-t pt-8 text-sm">
            Nothing is on the shelves yet.
          </p>
        )}
      </section>
    </>
  );
}

/** Left-aligned heading with a hairline rule — the page's one section rhythm. */
function SectionHeading({
  title,
  lead,
  action,
}: {
  title: string;
  lead?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
      <div>
        <h2 className="text-xl font-medium tracking-tight sm:text-2xl">{title}</h2>
        {lead && <p className="text-muted-foreground mt-1.5 text-sm">{lead}</p>}
      </div>
      {action}
    </div>
  );
}
