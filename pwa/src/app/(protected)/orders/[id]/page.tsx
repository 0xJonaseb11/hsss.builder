import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card } from "@/components/ui/card";
import { getOrder, requireBuilderProfile } from "@/lib/data";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireBuilderProfile();
  const order = await getOrder(profile.id, id);
  if (!order) notFound();

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div>
          <Link
            href="/orders"
            className="text-sm text-slate-500 hover:text-navy"
          >
            All orders
          </Link>
          <h1 className="text-xl font-semibold text-navy">{order.reference}</h1>
        </div>
        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Status</p>
              <p className="font-medium capitalize text-slate-900">
                {order.status}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Total</p>
              <p className="font-medium text-slate-900">
                {formatMoney(order.total)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Job reference</p>
              <p className="font-medium text-slate-900">
                {order.job_ref ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Submitted</p>
              <p className="font-medium text-slate-900">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}
