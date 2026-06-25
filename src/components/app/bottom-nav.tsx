"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconContact,
  IconDashboard,
  IconOrder,
  IconQuote,
} from "@/components/icons";
import { MAIN_NAV, isNavActive } from "@/lib/navigation";

const icons: Record<string, ReactNode> = {
  "/dashboard": <IconDashboard className="h-5 w-5" />,
  "/quotes": <IconQuote className="h-5 w-5" />,
  "/orders": <IconOrder className="h-5 w-5" />,
  "/contact": <IconContact className="h-5 w-5" />,
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1">
        {MAIN_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold transition sm:text-xs ${
                active ? "text-cyan" : "text-[var(--color-muted)] hover:text-navy"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  active ? "bg-cyan/15 text-navy" : ""
                }`}
              >
                {icons[item.href]}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
