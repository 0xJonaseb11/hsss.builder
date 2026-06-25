"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconChevronLeft } from "@/components/icons";

export function BackButton({
  href,
  label = "Back",
  className = "",
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  const classes = `inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-navy shadow-sm transition hover:border-cyan/40 hover:bg-cyan-soft/30 active:scale-[0.98] ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={`Back to ${label}`}>
        <IconChevronLeft className="h-4 w-4 text-cyan" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={classes}
      aria-label="Go back"
    >
      <IconChevronLeft className="h-4 w-4 text-cyan" />
      <span>{label}</span>
    </button>
  );
}
