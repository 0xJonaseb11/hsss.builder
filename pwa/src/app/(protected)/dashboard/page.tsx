import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { InstallPrompt } from "@/components/install-prompt";
import { DashboardActions } from "@/components/dashboard-actions";
import { OrdersTable } from "@/components/orders-table";
import { QuotesTable } from "@/components/quotes-table";
import { Card } from "@/components/ui/card";
import { getDashboardSummary, requireBuilderProfile } from "@/lib/data";

export default async function DashboardPage() {
  const profile = await requireBuilderProfile();
  const summary = await getDashboardSummary(profile.id);

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h1 className="text-xl font-semibold text-navy">{profile.company_name}</h1>
          <p className="text-sm text-slate-500">{profile.service_type}</p>
        </div>

        <InstallPrompt />

        <div className="grid grid-cols-3 gap-3">
          <Card>
            <p className="text-sm text-slate-500">Orders</p>
            <p className="mt-1 text-2xl font-semibold text-navy">
              {summary.orderTotal}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Submitted</p>
            <p className="mt-1 text-2xl font-semibold text-navy">
              {summary.ordersSubmitted}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Saved quotes</p>
            <p className="mt-1 text-2xl font-semibold text-navy">
              {summary.quotesOpen}
            </p>
          </Card>
        </div>

        <DashboardActions />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">Recent quotes</h2>
            <Link href="/quotes" className="text-sm font-medium text-navy hover:text-cyan">
              View all
            </Link>
          </div>
          <QuotesTable quotes={summary.recentQuotes} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">Recent orders</h2>
            <Link href="/orders" className="text-sm font-medium text-navy hover:text-cyan">
              View all
            </Link>
          </div>
          <OrdersTable orders={summary.recentOrders} />
        </div>
      </main>
    </>
  );
}
