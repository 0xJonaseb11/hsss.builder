import Link from "next/link";
import type { ReactNode } from "react";
import { IconChevronRight } from "@/components/icons";

export function ActionTile({
  href,
  title,
  description,
  icon,
  featured = false,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-start gap-4 rounded-2xl border p-5 transition duration-200 ${
        featured
          ? "border-cyan/30 bg-gradient-to-br from-cyan-soft to-white shadow-[var(--shadow-card)] hover:border-cyan/50 hover:shadow-[var(--shadow-elevated)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] hover:border-cyan/30 hover:shadow-[var(--shadow-elevated)]"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          featured ? "bg-cyan text-navy-deep" : "bg-navy/8 text-navy"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="font-semibold text-navy">{title}</span>
          <IconChevronRight className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-cyan" />
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-[var(--color-muted)]">
          {description}
        </span>
      </span>
    </Link>
  );
}
