"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconChevronLeft } from "@/components/icons";

export function BackButton({
  href,
  label = "Back",
  compact = false,
  className = "",
}: {
  href?: string;
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();

  const classes = `inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white text-sm font-medium text-navy shadow-sm transition hover:border-cyan/40 hover:bg-cyan-soft/30 active:scale-[0.98] ${
    compact ? "h-9 px-2" : "px-3 py-2"
  } ${className}`;

  const content = (
    <>
      <IconChevronLeft className="text-cyan" />
      {!compact && <span>{label}</span>}
      {compact && <span className="hidden sm:inline">{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={`Back to ${label}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={classes} aria-label="Go back">
      {content}
    </button>
  );
}
