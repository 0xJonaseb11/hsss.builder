import Link from "next/link";
import type { Quote } from "@/types/database";
import { formatMoney } from "@/lib/pricing";
import { isQuickQuotePayload } from "@/lib/quotes";

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
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
        <p className="text-sm font-medium text-slate-700">No saved quotes</p>
        <p className="mt-1 text-sm text-slate-500">
          Run a quick quote or save an order draft to see it here.
        </p>
        <Link
          href="/quotes/quick"
          className="mt-3 inline-block text-sm font-medium text-navy hover:text-cyan"
        >
          Quick quote
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Label</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => {
            const payload = quote.payload;
            const isQuick =
              typeof payload === "object" &&
              payload !== null &&
              isQuickQuotePayload(payload as Record<string, unknown>);
            return (
              <tr key={quote.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <Link
                    href={`/quotes/${quote.id}`}
                    className="font-medium text-navy hover:text-cyan"
                  >
                    {quote.reference}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-slate-600">
                  {isQuick ? "Quick" : "Order draft"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {quote.label ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDate(quote.created_at)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {formatMoney(quote.total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
