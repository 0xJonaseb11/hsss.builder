"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Builder } from "@/types/database";
import type { OrderScreenPayload } from "@/lib/orders";
import {
  emptyScreenDraft,
  orderTotal,
  screenDraftToPayload,
  type ScreenDraft,
} from "@/lib/orders";
import { SCREEN_TYPES } from "@/lib/orders";
import {
  AU_STATES,
  COLOURS,
  LOCATION_OPTIONS,
} from "@/lib/constants";
import { formatMoney } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";

function ScreenEditor({
  draft,
  onChange,
  onRemove,
  serviceType,
}: {
  draft: ScreenDraft;
  onChange: (draft: ScreenDraft) => void;
  onRemove: () => void;
  serviceType: Builder["service_type"];
}) {
  const preview = useMemo(() => {
    const result = screenDraftToPayload(draft, serviceType);
    return "error" in result ? null : result;
  }, [draft, serviceType]);

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-navy">Screen</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Remove
        </button>
      </div>
      <div>
        <span className="mb-1 block text-sm font-medium text-slate-600">
          Screen type
        </span>
        <select
          value={draft.type}
          onChange={(e) =>
            onChange({ ...draft, type: e.target.value as ScreenDraft["type"] })
          }
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          {SCREEN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <span className="mb-1 block text-sm font-medium text-slate-600">
          Location
        </span>
        <select
          value={draft.locationLabel}
          onChange={(e) => onChange({ ...draft, locationLabel: e.target.value })}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">Select location</option>
          {LOCATION_OPTIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      {draft.type === "Front & Return" && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Front (mm)"
            type="number"
            required
            value={draft.frontMM}
            onChange={(e) => onChange({ ...draft, frontMM: e.target.value })}
          />
          <Input
            label="Return (mm)"
            type="number"
            required
            value={draft.returnMM}
            onChange={(e) => onChange({ ...draft, returnMM: e.target.value })}
          />
        </div>
      )}
      {draft.type === "Front Only" && (
        <>
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Style
            </span>
            <select
              value={draft.frontOnlyStyle}
              onChange={(e) =>
                onChange({
                  ...draft,
                  frontOnlyStyle: e.target.value as ScreenDraft["frontOnlyStyle"],
                })
              }
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              <option value="panelDoor">Single door</option>
              <option value="panelDoorPanel">Door + panels</option>
            </select>
          </div>
          <Input
            label="Wall to wall (mm)"
            type="number"
            required
            value={draft.w2wMM}
            onChange={(e) => onChange({ ...draft, w2wMM: e.target.value })}
          />
        </>
      )}
      {draft.type === "Splayed" && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Wall A (mm)"
            type="number"
            required
            value={draft.wallA}
            onChange={(e) => onChange({ ...draft, wallA: e.target.value })}
          />
          <Input
            label="Wall B (mm)"
            type="number"
            required
            value={draft.wallB}
            onChange={(e) => onChange({ ...draft, wallB: e.target.value })}
          />
        </div>
      )}
      {draft.type === "Fixed Panel" && (
        <Input
          label="Panel width (mm)"
          type="number"
          required
          value={draft.panelMM}
          onChange={(e) => onChange({ ...draft, panelMM: e.target.value })}
        />
      )}
      {(draft.type === "Front & Return" || draft.type === "Front Only") && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.isSliding}
              onChange={(e) => onChange({ ...draft, isSliding: e.target.checked })}
            />
            Sliding door
          </label>
          {!draft.isSliding && (
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-600">
                Door width
              </span>
              <select
                value={draft.doorMM}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    doorMM: e.target.value as ScreenDraft["doorMM"],
                  })
                }
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
              >
                <option value="662">662 mm</option>
                <option value="762">762 mm</option>
              </select>
            </div>
          )}
        </div>
      )}
      <div>
        <span className="mb-1 block text-sm font-medium text-slate-600">
          Colour
        </span>
        <select
          value={draft.colour}
          onChange={(e) => onChange({ ...draft, colour: e.target.value })}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          {COLOURS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {preview && (
        <p className="text-sm text-slate-600">
          {preview.summary} — <strong>{formatMoney(preview.priceIncGst)}</strong>{" "}
          inc GST
        </p>
      )}
    </Card>
  );
}

export function OrderForm({ profile }: { profile: Builder }) {
  const router = useRouter();
  const isSupplyInstall = profile.service_type === "Supply & Install";
  const [jobRef, setJobRef] = useState("");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState(profile.state ?? "QLD");
  const [notes, setNotes] = useState("");
  const [siteContactName, setSiteContactName] = useState(profile.contact_name ?? "");
  const [siteContactPhone, setSiteContactPhone] = useState(profile.mobile ?? "");
  const [hobDate, setHobDate] = useState("");
  const [glassDate, setGlassDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [screens, setScreens] = useState<ScreenDraft[]>([emptyScreenDraft()]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previewScreens = useMemo(() => {
    const built: OrderScreenPayload[] = [];
    for (const draft of screens) {
      const result = screenDraftToPayload(draft, profile.service_type);
      if ("error" in result) return { error: result.error, screens: [] as OrderScreenPayload[] };
      built.push(result);
    }
    return { error: null as string | null, screens: built };
  }, [screens, profile.service_type]);

  const total = orderTotal(previewScreens.screens);

  function updateScreen(id: string, draft: ScreenDraft) {
    setScreens((prev) => prev.map((s) => (s.id === id ? draft : s)));
  }

  function removeScreen(id: string) {
    setScreens((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!jobRef.trim() || !address.trim() || !suburb.trim()) {
      setError("Job reference, address, and suburb are required.");
      return;
    }
    if (isSupplyInstall && (!hobDate || !glassDate)) {
      setError("Hob and glass dates are required for Supply & Install.");
      return;
    }
    if (!isSupplyInstall && !deliveryDate) {
      setError("Delivery date is required for Supply Only.");
      return;
    }
    if (previewScreens.error) {
      setError(previewScreens.error);
      return;
    }
    if (previewScreens.screens.length === 0) {
      setError("Add at least one screen.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobRef: jobRef.trim(),
        payload: {
          serviceType: profile.service_type,
          delivery: { address: address.trim(), suburb: suburb.trim(), state },
          siteContact:
            siteContactName.trim() && siteContactPhone.trim()
              ? { name: siteContactName.trim(), phone: siteContactPhone.trim() }
              : null,
          notes: notes.trim() || null,
          deliveryDates: isSupplyInstall
            ? { hobDate, glassDate }
            : { deliveryDate },
          screens: previewScreens.screens,
        },
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not submit order");
      return;
    }

    const body = await res.json();
    router.push(`/orders/${body.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-navy">Job details</h2>
        <Input
          label="Job reference"
          required
          value={jobRef}
          onChange={(e) => setJobRef(e.target.value)}
          placeholder="e.g. JOB-2026-014"
        />
        <Input
          label="Delivery address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Access, lockbox, delivery instructions..."
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-navy">Site contact</h2>
        <Input
          label="Contact name"
          value={siteContactName}
          onChange={(e) => setSiteContactName(e.target.value)}
        />
        <Input
          label="Contact phone"
          value={siteContactPhone}
          onChange={(e) => setSiteContactPhone(e.target.value)}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-navy">
          {isSupplyInstall ? "Install dates" : "Delivery date"}
        </h2>
        {isSupplyInstall ? (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Hob date"
              type="date"
              required
              value={hobDate}
              onChange={(e) => setHobDate(e.target.value)}
            />
            <Input
              label="Glass date"
              type="date"
              required
              value={glassDate}
              onChange={(e) => setGlassDate(e.target.value)}
            />
          </div>
        ) : (
          <Input
            label="Delivery date"
            type="date"
            required
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        )}
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy">Screens</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setScreens((prev) => [...prev, emptyScreenDraft()])}
          >
            Add screen
          </Button>
        </div>
        {screens.map((draft) => (
          <ScreenEditor
            key={draft.id}
            draft={draft}
            serviceType={profile.service_type}
            onChange={(next) => updateScreen(draft.id, next)}
            onRemove={() => removeScreen(draft.id)}
          />
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Order total (inc GST)</span>
          <span className="text-xl font-semibold text-navy">
            {formatMoney(total)}
          </span>
        </div>
      </Card>

      {error && <Notice variant="error">{error}</Notice>}

      <Button type="submit" full disabled={loading}>
        {loading ? "Submitting..." : "Submit order"}
      </Button>
    </form>
  );
}
