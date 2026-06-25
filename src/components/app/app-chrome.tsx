"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BackButton } from "@/components/app/back-button";
import { BottomNav } from "@/components/app/bottom-nav";
import { NavSheet } from "@/components/app/nav-sheet";
import { UserMenu } from "@/components/app/user-menu";
import { IconMenu } from "@/components/icons";
import { getBackNavigation, getPageTitle } from "@/lib/navigation";
import type { Builder } from "@/types/database";

export function AppChrome({ profile }: { profile: Builder }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const back = getBackNavigation(pathname);
  const title = getPageTitle(pathname);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:px-6">
          <div className="flex min-w-[88px] items-center">
            {back ? (
              <BackButton href={back.href} label={back.label} className="px-2.5 py-2" />
            ) : (
              <Link
                href="/dashboard"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-xs font-bold text-white"
              >
                H
              </Link>
            )}
          </div>

          <h1 className="flex-1 truncate text-center text-base font-semibold text-navy">
            {title}
          </h1>

          <div className="flex min-w-[88px] items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] text-navy shadow-sm hover:bg-slate-50"
              aria-label="Open menu"
            >
              <IconMenu />
            </button>
            <UserMenu profile={profile} />
          </div>
        </div>
      </header>

      <NavSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
      <BottomNav />
    </>
  );
}
