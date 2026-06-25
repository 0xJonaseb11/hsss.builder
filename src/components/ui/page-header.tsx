import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  backHref = "/dashboard",
  backLabel = "Dashboard",
  actions,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Link
          href={backHref}
          className="inline-flex items-center text-sm font-medium text-[var(--color-muted)] transition hover:text-navy"
        >
          {backLabel}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-base text-[var(--color-muted)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
