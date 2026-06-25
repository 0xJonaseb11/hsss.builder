"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function OrderActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createSample() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sample: true }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create sample order");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <Link
          href="/orders/new"
          className="inline-flex items-center rounded-md bg-cyan px-4 py-2.5 text-sm font-semibold text-navy-deep transition hover:bg-cyan/90"
        >
          New order
        </Link>
        <Button
          type="button"
          variant="secondary"
          onClick={createSample}
          disabled={loading}
        >
          {loading ? "Creating..." : "Sample order"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
