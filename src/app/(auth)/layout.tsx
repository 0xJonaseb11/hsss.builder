import type { ReactNode } from "react";
import { AppBrand } from "@/components/app-brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <AppBrand variant="dark" />
        </div>
        <div className="rounded-xl bg-white p-6 shadow-xl">{children}</div>
      </div>
    </div>
  );
}
