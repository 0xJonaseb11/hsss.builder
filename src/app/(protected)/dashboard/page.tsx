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
    <main className="app-main space-y-6">
      <div className="app-surface p-5 sm:p-6">
        <p className="text-sm font-medium text-[var(--color-muted)]">Welcome back</p>
        <h2 className="mt-1 text-2xl font-semibold text-navy">{profile.company_name}</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {profile.service_type}
          {profile.region ? ` · ${profile.region}` : ""}
        </p>
      </div>

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="Orders" value={summary.orderTotal} />
        <StatCard label="Submitted" value={summary.ordersSubmitted} />
        <StatCard label="Quotes" value={summary.quotesOpen} />
      </section>

      <InstallPrompt />
      <DashboardActions />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-navy">Recent quotes</h3>
          <Link href="/quotes" className="text-sm font-semibold text-cyan hover:text-navy">
            View all
          </Link>
        </div>
        <QuotesTable quotes={summary.recentQuotes} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-navy">Recent orders</h3>
          <Link href="/orders" className="text-sm font-semibold text-cyan hover:text-navy">
            View all
          </Link>
        </div>
        <OrdersTable orders={summary.recentOrders} />
      </section>
    </main>
  );
}
