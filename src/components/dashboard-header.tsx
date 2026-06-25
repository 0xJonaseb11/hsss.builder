"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
    <header className="border-b border-white/10 bg-navy-deep">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <Link href="/dashboard" className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">
              {profile.company_name}
            </p>
            <p className="truncate text-sm text-slate-300">
              {profile.service_type}
              {profile.region ? ` · ${profile.region}` : ""}
            </p>
          </Link>
          <Button
            variant="ghost"
            type="button"
            onClick={signOut}
            className="shrink-0 text-slate-300 hover:text-white"
          >
            Sign out
          </Button>
        </div>
        <nav
          className="mt-4 flex flex-wrap items-center gap-1"
          aria-label="Main"
        >
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-cyan hover:bg-white/5 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
