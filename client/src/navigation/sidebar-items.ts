import {
  Boxes,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";

import { routes, siteChrome } from "@/config/app-config";
import type { UserRole } from "@/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Who may see it. The API enforces the same split; this only hides links. */
  roles: UserRole[];
  /** Match nested routes too (e.g. /dashboard/orders/NW-1234). */
  matchNested?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Staff dashboard navigation.
 *
 * Structure — which routes exist, which icon each carries, and who may see it —
 * is code, because a link to a route the router does not serve is a broken page
 * rather than a wording choice. The visible labels come from site-content.json
 * so they can be renamed without touching a file five dashboard pages depend on.
 */
const labels = siteChrome.dashboard;
const OPERATIONS: UserRole[] = ["staff", "admin"];
const ADMIN_ONLY: UserRole[] = ["admin"];

export const sidebarItems: NavGroup[] = [
  {
    id: "overview",
    label: labels.groups.overview,
    items: [
      { title: labels.items.dashboard, href: routes.dashboard.root, icon: LayoutDashboard, roles: OPERATIONS },
    ],
  },
  {
    id: "operations",
    label: labels.groups.operations,
    items: [
      { title: labels.items.orders, href: routes.dashboard.orders, icon: ShoppingCart, roles: OPERATIONS, matchNested: true },
      { title: labels.items.inventory, href: routes.dashboard.inventory, icon: Boxes, roles: OPERATIONS },
    ],
  },
  {
    id: "catalogue",
    label: labels.groups.catalogue,
    items: [
      { title: labels.items.products, href: routes.dashboard.products, icon: Package, roles: ADMIN_ONLY, matchNested: true },
      { title: labels.items.users, href: routes.dashboard.users, icon: Users, roles: ADMIN_ONLY },
    ],
  },
  {
    id: "workspace",
    label: labels.groups.workspace,
    items: [{ title: labels.items.settings, href: routes.dashboard.settings, icon: Settings, roles: ADMIN_ONLY }],
  },
];

/** Groups with nothing visible to this role disappear entirely, headings included. */
export function visibleGroups(role: UserRole | undefined): NavGroup[] {
  if (!role) return [];
  return sidebarItems
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) }))
    .filter((group) => group.items.length > 0);
}
