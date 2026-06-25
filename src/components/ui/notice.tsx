import type { ReactNode } from "react";

type NoticeVariant = "success" | "info" | "warning" | "error";

const styles: Record<NoticeVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

export function Notice({
  variant = "info",
  title,
  children,
}: {
  variant?: NoticeVariant;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className={`rounded-md border px-4 py-3 text-sm ${styles[variant]}`}
    >
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? "mt-1 space-y-2" : "space-y-2"}>{children}</div>
    </div>
  );
}
