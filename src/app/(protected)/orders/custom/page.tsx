import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { CustomOrderForm } from "@/components/custom-order-form";
import { requireBuilderProfile } from "@/lib/data";

export default async function CustomOrderPage() {
  const profile = await requireBuilderProfile();

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-navy">
            Dashboard
          </Link>
          <h1 className="text-xl font-semibold text-navy">Custom order</h1>
        </div>
        <CustomOrderForm profile={profile} />
      </main>
    </>
  );
}
