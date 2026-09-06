import { Link } from "react-router-dom";
import { appConfig, siteChrome } from "@/config/app-config";
import { BrandMark } from "@/components/brand-mark";

/**
 * Renders on every storefront page, so its copy lives in site-content.json.
 * See `siteChrome` in config/app-config.ts for why.
 */
export function SiteFooter() {
  return (
    <footer data-builder-id="site.footer" className="bg-card border-t">
      <div className="text-muted-foreground container flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-foreground flex items-center gap-2">
          <BrandMark className="size-6" iconClassName="text-primary size-4" />
          <span className="font-medium">{appConfig.name}</span>
        </div>
        <p>
          {appConfig.tagline}. {siteChrome.footer.note}
        </p>
        <div className="flex gap-4">
          {siteChrome.footer.links.map((link) => (
            <Link key={link.href} to={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
