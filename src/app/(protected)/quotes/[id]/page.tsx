import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { QuoteDetailActions, QuoteDetailBody } from "@/components/quote-detail";
import { getQuote, requireBuilderProfile } from "@/lib/data";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireBuilderProfile();
  const quote = await getQuote(profile.id, id);
  if (!quote) notFound();

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div>
          <Link href="/quotes" className="text-sm text-slate-500 hover:text-navy">
            All quotes
          </Link>
          <h1 className="text-xl font-semibold text-navy">{quote.reference}</h1>
          {quote.label && (
            <p className="mt-1 text-sm text-slate-600">{quote.label}</p>
          )}
        </div>
        <QuoteDetailBody quote={quote} />
        <QuoteDetailActions quote={quote} />
      </main>
    </>
  );
}
