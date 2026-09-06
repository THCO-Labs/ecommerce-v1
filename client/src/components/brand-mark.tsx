import { ShoppingBasket } from "lucide-react";
import { appConfig } from "@/config/app-config";
import { cn } from "@/lib/utils";

export function BrandMark({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  if (appConfig.logoPath) {
    return <img src={appConfig.logoPath} alt={`${appConfig.name} logo`} className={cn("object-contain", className)} />;
  }
  return <ShoppingBasket aria-hidden="true" className={iconClassName ?? className} />;
}
