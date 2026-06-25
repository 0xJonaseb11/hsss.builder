"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CreateOrderButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createOrder() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/orders", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create order");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <Button type="button" onClick={createOrder} disabled={loading}>
        {loading ? "Creating..." : "New sample order"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
