import type { ReactNode } from "react";
import { AppBrand } from "@/components/app-brand";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-app-bg)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-deep/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <AppBrand variant="light" />
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
