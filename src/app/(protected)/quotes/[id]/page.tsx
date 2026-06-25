import { notFound } from "next/navigation";
import { QuoteDetailActions, QuoteDetailBody } from "@/components/quote-detail";
import { PageHeader } from "@/components/ui/page-header";
import { getQuote, requireBuilderProfile } from "@/lib/data";

export const metadata = { title: "Quote" };

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
    <main className="app-main space-y-8">
      <PageHeader
        title={quote.reference}
        description={quote.label ?? undefined}
        backHref="/quotes"
        backLabel="All quotes"
      />
      <QuoteDetailBody quote={quote} />
      <QuoteDetailActions quote={quote} />
    </main>
  );
}
