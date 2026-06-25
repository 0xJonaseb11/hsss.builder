"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Builder } from "@/types/database";
import { AU_STATES, HSSS_ORDER_EMAIL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";

export function CustomOrderForm({ profile }: { profile: Builder }) {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState(profile.state ?? "QLD");
  const [details, setDetails] = useState("");
  const [measureDate, setMeasureDate] = useState("");
  const [contactName, setContactName] = useState(profile.contact_name ?? "");
  const [contactPhone, setContactPhone] = useState(profile.mobile ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{
    reference: string;
    measureDate: string;
  } | null>(null);

  const minDate = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/custom-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        suburb,
        state,
        details,
        measureDate,
        contactName,
        contactPhone,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not submit custom order");
      return;
    }

    const body = await res.json();
    setSubmitted({ reference: body.reference, measureDate });
    router.refresh();
  }

  if (submitted) {
    return (
      <div className="space-y-4">
        <Notice variant="success" title="Custom order submitted">
          <p>
            Reference <strong>{submitted.reference}</strong> is saved. HSSS will
            contact you to confirm the measure date.
          </p>
          <p className="mt-2">
            Preferred date:{" "}
            <strong>
              {new Date(submitted.measureDate).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </p>
        </Notice>
        <p className="text-xs text-slate-500">
          HSSS will be notified at {HSSS_ORDER_EMAIL} when email delivery is
          enabled. Your request is already stored in the system.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex w-full items-center justify-center rounded-md bg-cyan px-4 py-2.5 text-sm font-semibold text-navy-deep hover:bg-cyan/90"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-violet-200 bg-violet-50/50">
        <p className="text-sm font-semibold text-violet-900">Non-standard screens</p>
        <p className="mt-1 text-sm text-violet-800/80">
          For jobs that do not fit stock sizes. Submit details and HSSS will
          arrange a site measure.
        </p>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-navy">Job address</h2>
        <Input
          label="Street address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Builder St"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Suburb"
            required
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
          />
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-600">
              State
            </span>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              {AU_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-navy">What do you need?</h2>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">
            Description
          </span>
          <textarea
            required
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Describe the screens, unusual angles, sizes, or requirements..."
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
          />
        </label>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-navy">Site contact</h2>
        <Input
          label="Name"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Who will be on site?"
        />
        <Input
          label="Phone"
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="0400 000 000"
        />
      </Card>

      <Card className="space-y-2">
        <Input
          label="Preferred measure date"
          type="date"
          required
          min={minDate}
          value={measureDate}
          onChange={(e) => setMeasureDate(e.target.value)}
        />
        <p className="text-xs text-slate-500">
          HSSS will confirm this date with you. This is a preferred date only.
        </p>
      </Card>

      {error && <Notice variant="error">{error}</Notice>}

      <Button type="submit" full disabled={loading}>
        {loading ? "Submitting..." : "Submit custom order"}
      </Button>
    </form>
  );
}
