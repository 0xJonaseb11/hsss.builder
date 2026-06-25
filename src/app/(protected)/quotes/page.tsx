import Link from "next/link";
import { QuotesTable } from "@/components/quotes-table";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { getQuotes, requireBuilderProfile } from "@/lib/data";

export const metadata = { title: "Quotes" };

export default async function QuotesPage() {
  const profile = await requireBuilderProfile();
  const quotes = await getQuotes(profile.id);
  const open = quotes.filter((q) => q.status === "saved");

  return (
    <main className="app-main space-y-8">
      <PageHeader
        title="My quotes"
        description={`${open.length} saved quote${open.length === 1 ? "" : "s"} ready to review or convert.`}
        actions={
          <Link href="/quotes/quick">
            <Button>Quick quote</Button>
          </Link>
        }
      />
      <QuotesTable quotes={quotes} />
    </main>
  );
}
