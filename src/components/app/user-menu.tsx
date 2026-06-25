"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconChevronRight } from "@/components/icons";
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
        className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition hover:border-cyan/40"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-navy-muted text-sm font-bold text-white">
          {initial}
        </span>
        <span className="hidden max-w-[120px] truncate text-sm font-semibold text-navy sm:block">
          {profile.company_name}
        </span>
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 text-slate-400 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-elevated)]"
        >
          <div className="border-b border-[var(--color-border)] bg-slate-50 px-4 py-3">
            <p className="truncate font-semibold text-navy">{profile.company_name}</p>
            <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
              {profile.service_type}
              {profile.region ? ` · ${profile.region}` : ""}
            </p>
          </div>
          <div className="p-1.5">
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-navy hover:bg-slate-50"
            >
              Dashboard
              <IconChevronRight className="text-slate-400" />
            </Link>
            <Link
              href="/contact"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-navy hover:bg-slate-50"
            >
              Contact HSSS
              <IconChevronRight className="text-slate-400" />
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
