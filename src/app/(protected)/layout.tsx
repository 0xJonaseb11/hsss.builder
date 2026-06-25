import type { ReactNode } from "react";
import { AppChrome } from "@/components/app/app-chrome";
import { requireBuilderProfile } from "@/lib/data";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireBuilderProfile();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-app-bg)] pb-[calc(4.25rem+env(safe-area-inset-bottom))]">
      <AppChrome profile={profile} />
      {children}
    </div>
  );
}
