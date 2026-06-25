import type { ReactNode } from "react";
import { AppBrand } from "@/components/app-brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="auth-gradient relative hidden flex-col justify-between p-10 text-white lg:flex">
        <AppBrand variant="light" />
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Shower screens, quotes, and orders. Built for builders on site.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-slate-300">
            Price jobs in minutes, submit orders with confidence, and reach the
            HSSS team when you need support.
          </p>
        </div>
        <p className="text-sm text-slate-400">HSSS builder portal</p>
      </aside>
      <div className="flex flex-col justify-center bg-[var(--color-app-bg)] px-4 py-10 sm:px-8">
        <div className="mb-8 flex justify-center lg:hidden">
          <AppBrand variant="dark" />
        </div>
        <div className="mx-auto w-full max-w-md">
          <div className="app-surface p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
