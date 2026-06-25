import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-3xl font-bold tracking-tight text-cyan">HSSS</p>
          <p className="mt-1 text-sm text-slate-300">Builder ordering</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-lg">{children}</div>
      </div>
    </div>
  );
}
