import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { OrderForm } from "@/components/order-form";
import { requireBuilderProfile } from "@/lib/data";

export default async function NewOrderPage() {
  const profile = await requireBuilderProfile();

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div>
          <Link
            href="/orders"
            className="text-sm text-slate-500 hover:text-navy"
          >
            Orders
          </Link>
          <h1 className="text-xl font-semibold text-navy">New order</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter job details and screen sizes. Pricing uses the same rules as
            the live builder app.
          </p>
        </div>
        <OrderForm profile={profile} />
      </main>
    </>
  );
}
