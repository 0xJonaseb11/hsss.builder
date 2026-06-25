import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { OrdersTable } from "@/components/orders-table";
import { CreateOrderButton } from "@/components/create-order-button";
import { getOrders, requireBuilderProfile } from "@/lib/data";

export default async function OrdersPage() {
  const profile = await requireBuilderProfile();
  const orders = await getOrders(profile.id);

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 hover:text-navy"
            >
              Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-navy">Orders</h1>
          </div>
          <CreateOrderButton />
        </div>
        <OrdersTable orders={orders} />
      </main>
    </>
  );
}
