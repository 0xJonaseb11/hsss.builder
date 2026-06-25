"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppBrand } from "@/components/app-brand";
import { Button } from "@/components/ui/button";
import type { Builder } from "@/types/database";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quotes", label: "Quotes" },
  { href: "/orders", label: "Orders" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardHeader({ profile }: { profile: Builder }) {
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-deep/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <AppBrand variant="light" showSubtitle={false} size="sm" linkTo="/dashboard" />
        <Button
          variant="ghost"
          type="button"
          size="sm"
          onClick={signOut}
          className="text-slate-300 hover:text-white"
        >
          Sign out
        </Button>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          <p className="mr-2 hidden truncate text-sm text-slate-400 sm:block">
            {profile.company_name}
          </p>
          <nav className="flex items-center gap-1" aria-label="Main">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-white text-navy shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
