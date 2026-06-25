import { DashboardHeader } from "@/components/dashboard-header";
import { InstallPrompt } from "@/components/install-prompt";
import { OrdersTable } from "@/components/orders-table";
import { OrderActions } from "@/components/order-actions";
import { Card } from "@/components/ui/card";
import { getOrders, requireBuilderProfile } from "@/lib/data";
import Link from "next/link";

export default async function DashboardPage() {
  const profile = await requireBuilderProfile();
  const orders = await getOrders(profile.id);
  const submitted = orders.filter((o) => o.status === "submitted").length;
  const total = orders.length;

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <InstallPrompt />
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-sm text-slate-500">Total orders</p>
            <p className="mt-1 text-2xl font-semibold text-navy">{total}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Submitted</p>
            <p className="mt-1 text-2xl font-semibold text-navy">{submitted}</p>
          </Card>
        </div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-navy">Recent orders</h2>
          <OrderActions />
        </div>
        <OrdersTable orders={orders.slice(0, 5)} />
        {orders.length > 5 && (
          <p className="text-center">
            <Link href="/orders" className="text-sm font-medium text-navy hover:text-cyan">
              View all orders
            </Link>
          </p>
        )}
      </main>
    </>
  );
}
