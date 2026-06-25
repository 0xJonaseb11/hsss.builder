import Link from "next/link";
import { InstallPrompt } from "@/components/install-prompt";
import { DashboardActions } from "@/components/dashboard-actions";
import { OrdersTable } from "@/components/orders-table";
import { QuotesTable } from "@/components/quotes-table";
import { StatCard } from "@/components/ui/stat-card";
import { getDashboardSummary, requireBuilderProfile } from "@/lib/data";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const profile = await requireBuilderProfile();
  const summary = await getDashboardSummary(profile.id);

  return (
    <main className="app-main space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-navy-deep text-white shadow-[var(--shadow-elevated)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(0_174_239/0.2),transparent_55%)]" />
        <div className="relative border-b border-white/10 px-6 py-8 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {profile.company_name}
          </h1>
          <p className="mt-2 text-base text-slate-300">
            {profile.service_type}
            {profile.region ? ` · ${profile.region}` : ""}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total orders" value={summary.orderTotal} />
        <StatCard label="Submitted" value={summary.ordersSubmitted} />
        <StatCard label="Saved quotes" value={summary.quotesOpen} />
      </section>

      <InstallPrompt />

      <DashboardActions />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-navy">Recent quotes</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Saved estimates and order drafts
            </p>
          </div>
          <Link
            href="/quotes"
            className="text-sm font-semibold text-navy hover:text-cyan"
          >
            View all
          </Link>
        </div>
        <QuotesTable quotes={summary.recentQuotes} />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-navy">Recent orders</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Latest submissions and status
            </p>
          </div>
          <Link
            href="/orders"
            className="text-sm font-semibold text-navy hover:text-cyan"
          >
            View all
          </Link>
        </div>
        <OrdersTable orders={summary.recentOrders} />
      </section>
    </main>
  );
}
