import Link from "next/link";
import type { Order } from "@/types/database";
import { isCustomOrderPayload } from "@/lib/custom-orders";

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
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
        <p className="text-sm font-medium text-slate-700">No orders yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Orders you submit will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Job</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isCustom = isCustomOrderPayload(order.payload);
            return (
            <tr key={order.id} className="border-t border-slate-100">
              <td className="px-4 py-3">
                <Link
                  href={`/orders/${order.id}`}
                  className="font-medium text-navy hover:text-cyan"
                >
                  {order.reference}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {isCustom ? "Custom" : order.payload.sample ? "Sample" : "Standard"}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {order.job_ref ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {formatDate(order.created_at)}
              </td>
              <td className="px-4 py-3 capitalize text-slate-700">
                {order.status}
              </td>
              <td className="px-4 py-3 text-right font-medium text-slate-900">
                {isCustom ? "—" : formatMoney(order.total)}
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}
