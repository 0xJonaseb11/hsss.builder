import { OrdersTable } from "@/components/orders-table";
import { OrderActions } from "@/components/order-actions";
import { PageHeader } from "@/components/ui/page-header";
import { getOrders, requireBuilderProfile } from "@/lib/data";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const profile = await requireBuilderProfile();
  const orders = await getOrders(profile.id);

  return (
    <main className="app-main space-y-8">
      <PageHeader
        title="Orders"
        description="Submitted jobs, samples, and custom requests."
        actions={<OrderActions />}
      />
      <OrdersTable orders={orders} />
    </main>
  );
}
