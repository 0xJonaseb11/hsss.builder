"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Builder } from "@/types/database";
import {
  emptyScreenDraft,
  OrderScreenPayload,
  orderTotal,
  screenDraftToPayload,
  screenPriceExGst,
  type InitialOrderData,
  type ScreenDraft,
} from "@/lib/orders";
import { SCREEN_TYPES } from "@/lib/orders";
import {
  ANGLE_HEIGHTS,
  AU_STATES,
  COLOURS,
  HINGE_SIDES,
  LOCATION_OPTIONS,
  SWING_DIRECTIONS,
  type AngleHeight,
} from "@/lib/constants";
import { formatMoney } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { ChipRow, FieldSection, SelectField } from "@/components/ui/field";
import { ScreenDiagram } from "@/components/screen-diagram";

function ScreenEditor({
  draft,
  index,
  onChange,
  onRemove,
  serviceType,
  canRemove,
}: {
  draft: ScreenDraft;
  index: number;
  onChange: (draft: ScreenDraft) => void;
  onRemove: () => void;
  serviceType: Builder["service_type"];
  canRemove: boolean;
}) {
  const preview = useMemo(() => {
    const result = screenDraftToPayload(draft, serviceType);
    return "error" in result ? null : result;
  }, [draft, serviceType]);

  const showDoorOptions =
    draft.type === "Front & Return" || draft.type === "Front Only";
  const showSwing = showDoorOptions && !draft.isSliding;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-navy">
            Screen {index + 1}
          </p>
          <p className="text-xs text-slate-500">{draft.type}</p>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        {/* Config column */}
        <div className="space-y-6 border-b border-slate-100 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <FieldSection title="Basics">
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Screen type"
                value={draft.type}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    type: e.target.value as ScreenDraft["type"],
                  })
                }
              >
                {SCREEN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Location"
                value={draft.locationLabel}
                onChange={(e) =>
                  onChange({ ...draft, locationLabel: e.target.value })
                }
              >
                <option value="">Select location</option>
                {LOCATION_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </SelectField>
            </div>
            <SelectField
              label="Colour"
              value={draft.colour}
              onChange={(e) => onChange({ ...draft, colour: e.target.value })}
            >
              {COLOURS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
          </FieldSection>

          <FieldSection title="Sizes" description="Enter measurements in mm">
            {draft.type === "Front & Return" && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Front (mm)"
                  type="number"
                  required
                  value={draft.frontMM}
                  onChange={(e) =>
                    onChange({ ...draft, frontMM: e.target.value })
                  }
                />
                <Input
                  label="Return (mm)"
                  type="number"
                  required
                  value={draft.returnMM}
                  onChange={(e) =>
                    onChange({ ...draft, returnMM: e.target.value })
                  }
                />
              </div>
            )}
            {draft.type === "Front Only" && (
              <>
                <ChipRow label="Style" columns={3}>
                  {(
                    [
                      ["panelDoor", "Panel + door"],
                      ["panelDoorPanel", "Door + panels"],
                      ["doorCentred", "Door centred"],
                    ] as const
                  ).map(([value, label]) => (
                    <ChoiceChip
                      key={value}
                      selected={draft.frontOnlyStyle === value}
                      onClick={() =>
                        onChange({ ...draft, frontOnlyStyle: value })
                      }
                      className="px-2 text-xs sm:text-sm"
                    >
                      {label}
                    </ChoiceChip>
                  ))}
                </ChipRow>
                <Input
                  label="Wall to wall (mm)"
                  type="number"
                  required
                  value={draft.w2wMM}
                  onChange={(e) =>
                    onChange({ ...draft, w2wMM: e.target.value })
                  }
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
                  onChange={(e) =>
                    onChange({ ...draft, wallA: e.target.value })
                  }
                />
                <Input
                  label="Wall B (mm)"
                  type="number"
                  required
                  value={draft.wallB}
                  onChange={(e) =>
                    onChange({ ...draft, wallB: e.target.value })
                  }
                />
              </div>
            )}
            {draft.type === "Fixed Panel" && (
              <Input
                label="Panel width (mm)"
                type="number"
                required
                value={draft.panelMM}
                onChange={(e) =>
                  onChange({ ...draft, panelMM: e.target.value })
                }
              />
            )}
          </FieldSection>

          <FieldSection title="Finish">
            <ChipRow label="Angle height" columns={3}>
              {ANGLE_HEIGHTS.map((h) => (
                <ChoiceChip
                  key={h}
                  selected={draft.angleHeight === h}
                  onClick={() =>
                    onChange({ ...draft, angleHeight: h as AngleHeight })
                  }
                >
                  {h} mm
                </ChoiceChip>
              ))}
            </ChipRow>
          </FieldSection>

          {showDoorOptions && (
            <FieldSection
              title="Door"
              description="Choose hinged or sliding, then set handing"
            >
              <ChipRow label="Door type">
                <ChoiceChip
                  selected={!draft.isSliding}
                  onClick={() => onChange({ ...draft, isSliding: false })}
                >
                  Hinged
                </ChoiceChip>
                <ChoiceChip
                  selected={draft.isSliding}
                  onClick={() => onChange({ ...draft, isSliding: true })}
                >
                  Sliding
                </ChoiceChip>
              </ChipRow>

              {showSwing && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <ChipRow label="Door width">
                    {(["662", "762"] as const).map((w) => (
                      <ChoiceChip
                        key={w}
                        selected={draft.doorMM === w}
                        onClick={() => onChange({ ...draft, doorMM: w })}
                      >
                        {w} mm
                      </ChoiceChip>
                    ))}
                  </ChipRow>
                  <ChipRow label="Hinge side">
                    {HINGE_SIDES.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        selected={draft.hingeSide === opt.value}
                        onClick={() =>
                          onChange({ ...draft, hingeSide: opt.value })
                        }
                      >
                        {opt.label}
                      </ChoiceChip>
                    ))}
                  </ChipRow>
                  <ChipRow label="Door swing">
                    {SWING_DIRECTIONS.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        selected={draft.swingDirection === opt.value}
                        onClick={() =>
                          onChange({
                            ...draft,
                            swingDirection: opt.value,
                          })
                        }
                      >
                        {opt.label}
                      </ChoiceChip>
                    ))}
                  </ChipRow>
                </div>
              )}
            </FieldSection>
          )}
        </div>

        {/* Diagram column — first on mobile so builders see the plan early */}
        <div className="order-first bg-slate-50/40 p-4 sm:p-5 lg:order-none lg:sticky lg:top-20 lg:self-start">
          <ScreenDiagram
            type={draft.type}
            frontOnlyStyle={draft.frontOnlyStyle}
            isSliding={draft.isSliding}
            hingeSide={draft.hingeSide}
            swingDirection={draft.swingDirection}
            angleHeight={draft.angleHeight}
            frontMM={draft.frontMM}
            returnMM={draft.returnMM}
            w2wMM={draft.w2wMM}
            panelMM={draft.panelMM}
            wallA={draft.wallA}
            wallB={draft.wallB}
          />
        </div>
      </div>

      {preview && (
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 bg-gradient-to-br from-white to-cyan-soft/40 px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Screen total
            </p>
            <p className="mt-0.5 truncate text-sm text-slate-600">
              {preview.summary}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold text-navy">
              {formatMoney(screenPriceExGst(preview))}
            </p>
            <p className="text-xs text-slate-500">
              ex GST · {formatMoney(preview.priceIncGst)} inc
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

export function OrderForm({
  profile,
  initial,
}: {
  profile: Builder;
  initial?: InitialOrderData;
}) {
  const router = useRouter();
  const isSupplyInstall = profile.service_type === "Supply & Install";
  const [jobRef, setJobRef] = useState(initial?.jobRef ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [suburb, setSuburb] = useState(initial?.suburb ?? "");
  const [state, setState] = useState(initial?.state ?? profile.state ?? "QLD");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [siteContactName, setSiteContactName] = useState(
    initial?.siteContactName ?? profile.contact_name ?? ""
  );
  const [siteContactPhone, setSiteContactPhone] = useState(
    initial?.siteContactPhone ?? profile.mobile ?? ""
  );
  const [hobDate, setHobDate] = useState(initial?.hobDate ?? "");
  const [glassDate, setGlassDate] = useState(initial?.glassDate ?? "");
  const [deliveryDate, setDeliveryDate] = useState(initial?.deliveryDate ?? "");
  const [screens, setScreens] = useState<ScreenDraft[]>(
    initial?.screens?.length ? initial.screens : [emptyScreenDraft()]
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const previewScreens = useMemo(() => {
    const built: OrderScreenPayload[] = [];
    for (const draft of screens) {
      const result = screenDraftToPayload(draft, profile.service_type);
      if ("error" in result)
        return { error: result.error, screens: [] as OrderScreenPayload[] };
      built.push(result);
    }
    return { error: null as string | null, screens: built };
  }, [screens, profile.service_type]);

  const total = orderTotal(previewScreens.screens);

  function updateScreen(id: string, draft: ScreenDraft) {
    setScreens((prev) => prev.map((s) => (s.id === id ? draft : s)));
  }

  function removeScreen(id: string) {
    setScreens((prev) =>
      prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)
    );
  }

  function buildPayload() {
    return {
      kind: "order" as const,
      jobRef: jobRef.trim() || undefined,
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
    };
  }

  async function saveDraft() {
    setSavingDraft(true);
    setError(null);
    if (previewScreens.error) {
      setError(previewScreens.error);
      setSavingDraft(false);
      return;
    }
    if (previewScreens.screens.length === 0) {
      setError("Add at least one screen to save a draft.");
      setSavingDraft(false);
      return;
    }
    const payload = buildPayload();
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteKind: "order",
        label:
          jobRef.trim() || `Draft · ${previewScreens.screens.length} screens`,
        total,
        payload,
      }),
    });
    setSavingDraft(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not save draft");
      return;
    }
    const body = await res.json();
    router.push(`/quotes/${body.id}`);
    router.refresh();
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
        payload: buildPayload(),
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
        {screens.map((draft, index) => (
          <ScreenEditor
            key={draft.id}
            draft={draft}
            index={index}
            canRemove={screens.length > 1}
            serviceType={profile.service_type}
            onChange={(next) => updateScreen(draft.id, next)}
            onRemove={() => removeScreen(draft.id)}
          />
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Order total (ex GST)</span>
          <span className="text-xl font-semibold text-navy">
            {formatMoney(total)}
          </span>
        </div>
      </Card>

      {error && <Notice variant="error">{error}</Notice>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" full disabled={loading || savingDraft}>
          {loading ? "Submitting..." : "Submit order"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          full
          disabled={loading || savingDraft}
          onClick={saveDraft}
        >
          {savingDraft ? "Saving..." : "Save draft to quotes"}
        </Button>
      </div>
    </form>
  );
}
