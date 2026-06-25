"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  IconClose,
  IconContact,
  IconCustom,
  IconDashboard,
  IconOrder,
  IconQuote,
} from "@/components/icons";
import { MAIN_NAV, QUICK_NAV, isNavActive } from "@/lib/navigation";

const navIcons: Record<string, ReactNode> = {
  "/dashboard": <IconDashboard className="h-5 w-5" />,
  "/quotes": <IconQuote className="h-5 w-5" />,
  "/orders": <IconOrder className="h-5 w-5" />,
  "/contact": <IconContact className="h-5 w-5" />,
  "/quotes/quick": <IconQuote className="h-5 w-5" />,
  "/orders/new": <IconOrder className="h-5 w-5" />,
  "/orders/custom": <IconCustom className="h-5 w-5" />,
};

export function NavSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="relative w-full max-w-lg rounded-t-3xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-elevated)] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <p className="text-lg font-semibold text-navy">Menu</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border)] p-2 text-navy hover:bg-slate-50"
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Quick actions
          </p>
          <div className="space-y-1">
            {QUICK_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-navy transition hover:bg-cyan-soft/50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/15 text-navy">
                  {navIcons[item.href]}
                </span>
                <span className="font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>

          <p className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Navigate
          </p>
          <div className="space-y-1">
            {MAIN_NAV.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                    active
                      ? "bg-navy text-white"
                      : "text-navy hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      active ? "bg-white/15" : "bg-slate-100"
                    }`}
                  >
                    {navIcons[item.href]}
                  </span>
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
