import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { InstallPrompt } from "@/components/install-prompt";
import { DashboardActions } from "@/components/dashboard-actions";
import { OrdersTable } from "@/components/orders-table";
import { QuotesTable } from "@/components/quotes-table";
import { getDashboardSummary, requireBuilderProfile } from "@/lib/data";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const profile = await requireBuilderProfile();
  const summary = await getDashboardSummary(profile.id);

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <section className="overflow-hidden rounded-xl bg-navy-deep text-white shadow-lg">
          <div className="border-b border-white/10 px-5 py-5">
            <p className="text-sm font-medium text-cyan">Your dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold">{profile.company_name}</h1>
            <p className="mt-1 text-sm text-slate-300">
              {profile.service_type}
              {profile.region ? ` · ${profile.region}` : ""}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Quotes, orders, and support — everything in one place.
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/10">
            <div className="px-4 py-4 text-center">
              <p className="text-2xl font-semibold">{summary.orderTotal}</p>
              <p className="mt-1 text-xs text-slate-400">Orders</p>
            </div>
            <div className="px-4 py-4 text-center">
              <p className="text-2xl font-semibold">{summary.ordersSubmitted}</p>
              <p className="mt-1 text-xs text-slate-400">Submitted</p>
            </div>
            <div className="px-4 py-4 text-center">
              <p className="text-2xl font-semibold">{summary.quotesOpen}</p>
              <p className="mt-1 text-xs text-slate-400">Saved quotes</p>
            </div>
          </div>
        </section>

        <InstallPrompt />

        <DashboardActions />

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-navy">Recent quotes</h2>
              <p className="text-sm text-slate-500">Saved estimates and drafts</p>
            </div>
            <Link
              href="/quotes"
              className="shrink-0 text-sm font-medium text-navy hover:text-cyan"
            >
              View all
            </Link>
          </div>
          <QuotesTable quotes={summary.recentQuotes} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-navy">Recent orders</h2>
              <p className="text-sm text-slate-500">Latest submissions and status</p>
            </div>
            <Link
              href="/orders"
              className="shrink-0 text-sm font-medium text-navy hover:text-cyan"
            >
              View all
            </Link>
          </div>
          <OrdersTable orders={summary.recentOrders} />
        </section>
      </main>
    </>
  );
}
