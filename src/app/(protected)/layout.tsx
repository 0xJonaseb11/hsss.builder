import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { requireBuilderProfile } from "@/lib/data";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireBuilderProfile();

  return (
    <div className="min-h-screen bg-[var(--color-app-bg)]">
      <DashboardHeader profile={profile} />
      {children}
    </div>
  );
}
