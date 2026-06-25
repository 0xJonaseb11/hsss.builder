import Link from "next/link";
import type { Order } from "@/types/database";
import { isCustomOrderPayload } from "@/lib/custom-orders";
import { EMPTY_CELL } from "@/lib/site";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="app-surface flex flex-col items-center px-6 py-14 text-center">
        <p className="text-lg font-semibold text-navy">No orders yet</p>
        <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
          Submit your first order and it will appear here with reference and status.
        </p>
        <Link
          href="/orders/new"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-navy-deep shadow-sm transition hover:bg-cyan/90"
        >
          Create order
        </Link>
      </div>
    );
  }

  return (
    <div className="app-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-slate-50/80 text-[var(--color-muted)]">
              <th className="px-5 py-3.5 font-semibold">Reference</th>
              <th className="px-5 py-3.5 font-semibold">Type</th>
              <th className="px-5 py-3.5 font-semibold">Job</th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {orders.map((order) => {
              const isCustom = isCustomOrderPayload(order.payload);
              return (
                <tr key={order.id} className="transition hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-semibold text-navy hover:text-cyan"
                    >
                      {order.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[var(--color-muted)]">
                    {isCustom ? "Custom" : order.payload.sample ? "Sample" : "Standard"}
                  </td>
                  <td className="px-5 py-4 text-[var(--color-muted)]">
                    {order.job_ref ?? EMPTY_CELL}
                  </td>
                  <td className="px-5 py-4 text-[var(--color-muted)]">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={order.status === "submitted" ? "success" : "default"}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-900">
                    {isCustom ? EMPTY_CELL : formatMoney(order.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
