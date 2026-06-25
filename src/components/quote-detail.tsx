"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { Quote } from "@/types/database";
import {
  isOrderQuotePayload,
  isQuickQuotePayload,
} from "@/lib/quotes";
import { formatMoney } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function QuoteDetailActions({ quote }: { quote: Quote }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payload = quote.payload;

  async function convert() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/quotes/${quote.id}/convert`, { method: "POST" });
    setLoading(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Could not convert quote");
      return;
    }
    router.push(body.redirect);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this saved quote?")) return;
    setLoading(true);
    const res = await fetch(`/api/quotes/${quote.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not delete quote");
      return;
    }
    router.push("/quotes");
    router.refresh();
  }

  if (quote.status === "converted" && quote.order_id) {
    return (
      <Notice variant="info">
        Converted to order.{" "}
        <Link href={`/orders/${quote.order_id}`} className="font-medium text-navy">
          View order
        </Link>
      </Notice>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {isQuickQuotePayload(payload) && (
        <Link
          href={`/orders/new?fromQuote=${quote.id}`}
          className="inline-flex items-center rounded-md bg-cyan px-4 py-2.5 text-sm font-semibold text-navy-deep hover:bg-cyan/90"
        >
          Start order from quote
        </Link>
      )}
      {isOrderQuotePayload(payload) && (
        <Button type="button" onClick={convert} disabled={loading}>
          {loading ? "Submitting..." : "Submit as order"}
        </Button>
      )}
      <Button type="button" variant="secondary" onClick={remove} disabled={loading}>
        Delete
      </Button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function QuoteDetailBody({ quote }: { quote: Quote }) {
  const payload = quote.payload;

  return (
    <>
      <Card className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-500">Type</p>
          <p className="font-medium capitalize text-slate-900">
            {quote.quote_kind === "quick" ? "Quick quote" : "Order draft"}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Total</p>
          <p className="font-medium text-slate-900">{formatMoney(quote.total)}</p>
        </div>
        <div>
          <p className="text-slate-500">Saved</p>
          <p className="font-medium text-slate-900">{formatDate(quote.created_at)}</p>
        </div>
        <div>
          <p className="text-slate-500">Status</p>
          <p className="font-medium capitalize text-slate-900">{quote.status}</p>
        </div>
      </Card>

      {isQuickQuotePayload(payload) && (
        <Card className="text-sm text-slate-700">
          <p className="font-semibold text-navy">{payload.summary}</p>
          <p className="mt-2 text-slate-600">
            {payload.serviceType} · {payload.colour}
          </p>
        </Card>
      )}

      {isOrderQuotePayload(payload) && (
        <>
          <Card className="space-y-2 text-sm text-slate-700">
            <h2 className="font-semibold text-navy">Job</h2>
            {payload.jobRef && <p>Reference: {payload.jobRef}</p>}
            <p>
              {payload.delivery.address}, {payload.delivery.suburb}{" "}
              {payload.delivery.state}
            </p>
            {payload.notes && <p>Notes: {payload.notes}</p>}
          </Card>
          <Card className="space-y-2">
            <h2 className="text-sm font-semibold text-navy">Screens</h2>
            <ul className="divide-y divide-slate-100 text-sm">
              {payload.screens.map((screen, i) => (
                <li key={`${screen.summary}-${i}`} className="flex justify-between py-2">
                  <span className="text-slate-700">{screen.summary}</span>
                  <span className="font-medium">{formatMoney(screen.priceIncGst)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </>
  );
}
