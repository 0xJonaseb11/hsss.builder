export type NavItem = {
  href: string;
  label: string;
};

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quotes", label: "Quotes" },
  { href: "/orders", label: "Orders" },
  { href: "/contact", label: "Contact" },
];

export const QUICK_NAV: NavItem[] = [
  { href: "/quotes/quick", label: "Quick quote" },
  { href: "/orders/new", label: "New order" },
  { href: "/orders/custom", label: "Custom order" },
];

const SECTION_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  quotes: "Quotes",
  orders: "Orders",
  contact: "Contact",
  new: "New order",
  quick: "Quick quote",
  custom: "Custom order",
};

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";
  if (segments.length === 1) {
    return SECTION_LABELS[segments[0]] ?? "Dashboard";
  }
  const last = segments[segments.length - 1];
  if (last === "new" || last === "quick" || last === "custom") {
    return SECTION_LABELS[last] ?? last;
  }
  if (segments.length === 2) {
    return SECTION_LABELS[segments[0]] ?? segments[0];
  }
  return SECTION_LABELS[segments[0]] ?? "Details";
}

export function getBackNavigation(
  pathname: string
): { href: string; label: string } | null {
  if (pathname === "/dashboard") return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1) {
    return { href: "/dashboard", label: "Dashboard" };
  }

  const parentPath = `/${segments.slice(0, -1).join("/")}`;
  const parentSegment = segments[segments.length - 2];
  const label = SECTION_LABELS[parentSegment] ?? parentSegment;

  return { href: parentPath, label };
}
