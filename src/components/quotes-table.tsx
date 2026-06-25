import Link from "next/link";
import type { Quote } from "@/types/database";
import { formatMoney } from "@/lib/pricing";
import { isQuickQuotePayload } from "@/lib/quotes";
import { EMPTY_CELL } from "@/lib/site";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function QuotesTable({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) {
    return (
      <div className="app-surface flex flex-col items-center px-6 py-14 text-center">
        <p className="text-lg font-semibold text-navy">No saved quotes</p>
        <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
          Run a quick quote or save an order draft to build your estimate library.
        </p>
        <Link
          href="/quotes/quick"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-navy-deep shadow-sm transition hover:bg-cyan/90"
        >
          Quick quote
        </Link>
      </div>
    );
  }

  return (
    <div className="app-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-slate-50/80 text-[var(--color-muted)]">
              <th className="px-5 py-3.5 font-semibold">Reference</th>
              <th className="px-5 py-3.5 font-semibold">Type</th>
              <th className="px-5 py-3.5 font-semibold">Label</th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
              <th className="px-5 py-3.5 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {quotes.map((quote) => {
              const payload = quote.payload;
              const isQuick =
                typeof payload === "object" &&
                payload !== null &&
                isQuickQuotePayload(payload as Record<string, unknown>);
              return (
                <tr key={quote.id} className="transition hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <Link
                      href={`/quotes/${quote.id}`}
                      className="font-semibold text-navy hover:text-cyan"
                    >
                      {quote.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="navy">{isQuick ? "Quick quote" : "Order draft"}</Badge>
                  </td>
                  <td className="px-5 py-4 text-[var(--color-muted)]">
                    {quote.label ?? EMPTY_CELL}
                  </td>
                  <td className="px-5 py-4 text-[var(--color-muted)]">
                    {formatDate(quote.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-900">
                    {formatMoney(quote.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
