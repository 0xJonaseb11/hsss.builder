import { QuickQuoteForm } from "@/components/quick-quote-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireBuilderProfile } from "@/lib/data";

export const metadata = { title: "Quick quote" };

export default async function QuickQuotePage() {
  const profile = await requireBuilderProfile();

  return (
    <main className="app-main space-y-8">
      <PageHeader
        title="Quick quote"
        description="Get a fast price estimate for a single screen — no full job required."
      />
      <QuickQuoteForm profile={profile} />
    </main>
  );
}
