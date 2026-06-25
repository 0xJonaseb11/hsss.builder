import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { QuotesTable } from "@/components/quotes-table";
import { getQuotes, requireBuilderProfile } from "@/lib/data";

export default async function QuotesPage() {
  const profile = await requireBuilderProfile();
  const quotes = await getQuotes(profile.id);
  const open = quotes.filter((q) => q.status === "saved");

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-navy">
              Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-navy">My quotes</h1>
            <p className="mt-1 text-sm text-slate-500">
              {open.length} saved quote{open.length === 1 ? "" : "s"}
            </p>
          </div>
          <Link
            href="/quotes/quick"
            className="inline-flex items-center rounded-md bg-cyan px-4 py-2.5 text-sm font-semibold text-navy-deep hover:bg-cyan/90"
          >
            Quick quote
          </Link>
        </div>
        <QuotesTable quotes={quotes} />
      </main>
    </>
  );
}
