"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Builder } from "@/types/database";

export function UserMenu({ profile }: { profile: Builder }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = profile.company_name?.[0]?.toUpperCase() ?? "B";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white py-1 pl-1 pr-2 shadow-sm transition hover:border-cyan/40"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${profile.company_name}`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-600 text-xs font-bold text-white">
          {initial}
        </span>
        <span className="hidden max-w-[100px] truncate text-xs font-medium text-navy md:inline">
          {profile.company_name}
        </span>
        <svg
          viewBox="0 0 12 12"
          className={`h-2.5 w-2.5 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-elevated)]"
        >
          <div className="border-b border-[var(--color-border)] bg-slate-50 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-navy">{profile.company_name}</p>
            <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
              {profile.service_type}
              {profile.region ? ` · ${profile.region}` : ""}
            </p>
          </div>
          <div className="p-1">
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-slate-50"
            >
              Dashboard
            </Link>
            <Link
              href="/contact"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-slate-50"
            >
              Contact HSSS
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              className="mt-0.5 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
