"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Builder } from "@/types/database";
import {
  ANGLE_HEIGHTS,
  COLOURS,
  FIXED_STYLES,
  HINGE_SIDES,
  RETURN_SIDES,
  SIDE_PANEL_PRESETS,
  SIDES,
  SPLAYED_SIZES,
  SWING_DIRECTIONS,
  type AngleHeight,
  type QuickScreenKey,
} from "@/lib/constants";
import { formatMoney } from "@/lib/pricing";
import type { QuickQuotePayload } from "@/lib/quotes";
import {
  emptyScreenDraft,
  frontOnlyW2w,
  screenDraftToPayload,
  screenPriceExGst,
  type ScreenDraft,
  type ScreenType,
} from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { ChoiceChip } from "@/components/ui/choice-chip";
import {
  ChipRow,
  FieldSection,
  SelectField,
  fieldControlClass,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScreenDiagram } from "@/components/screen-diagram";

const SCREEN_OPTIONS: { key: QuickScreenKey; type: ScreenType; label: string }[] =
  [
    { key: "frontReturn", type: "Front & Return", label: "Front & Return" },
    { key: "frontOnly", type: "Front Only", label: "Front Only" },
    { key: "splayed", type: "Splayed", label: "Splayed" },
    { key: "fixedPanel", type: "Fixed Panel", label: "Fixed Panel" },
  ];

function typeToKey(type: ScreenType): QuickScreenKey {
  return (
    SCREEN_OPTIONS.find((o) => o.type === type)?.key ?? "frontReturn"
  );
}

export function QuickQuoteForm({ profile }: { profile: Builder }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ScreenDraft>(() => emptyScreenDraft());
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const screenKey = typeToKey(draft.type);
  const showDoor =
    draft.type === "Front & Return" || draft.type === "Front Only";
  const showSwing = (showDoor && !draft.isSliding) || draft.type === "Splayed";
  const foW2w =
    draft.frontOnlyStyle === "panelDoorPanel"
      ? frontOnlyW2w(draft)
      : Number(draft.w2wMM) || 0;

  const preview = useMemo(() => {
    const result = screenDraftToPayload(draft, profile.service_type);
    return "error" in result ? null : result;
  }, [draft, profile.service_type]);

  function patch( partial: Partial<ScreenDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  async function saveQuote() {
    setLoading(true);
    setError(null);
    setSaved(false);
    const result = screenDraftToPayload(draft, profile.service_type);
    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }
    const payload: QuickQuotePayload = {
      kind: "quick",
      serviceType: profile.service_type,
      screenKey,
      colour: draft.colour,
      summary: result.summary,
      priceExGst: result.priceExGst,
      priceIncGst: result.priceIncGst,
      config: result.config,
    };
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteKind: "quick",
        label: label.trim() || result.summary,
        total: screenPriceExGst(result),
        payload,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not save quote");
      return;
    }
    const body = await res.json();
    setSaved(true);
    router.push(`/quotes/${body.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Get a fast price estimate. Save it to My Quotes or start a full order
        from the quote later.
      </p>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6">
          <h2 className="text-sm font-semibold text-navy">Screen type</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 p-5 sm:p-6">
          {SCREEN_OPTIONS.map((opt) => (
            <ChoiceChip
              key={opt.key}
              selected={draft.type === opt.type}
              onClick={() =>
                patch({
                  type: opt.type,
                  isSliding: false,
                  doorMM: "662",
                })
              }
            >
              {opt.label}
            </ChoiceChip>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-6">
          <FieldSection title="Basics">
            <SelectField
              label="Colour"
              value={draft.colour}
              onChange={(e) => patch({ colour: e.target.value })}
            >
              {COLOURS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
          </FieldSection>

          <FieldSection title="Layout & sizes" description="All sizes in mm - plan view">
            {draft.type === "Front & Return" && (
              <>
                <ChipRow label="Return side">
                  {RETURN_SIDES.map((opt) => (
                    <ChoiceChip
                      key={opt.value}
                      selected={draft.returnSide === opt.value}
                      onClick={() => patch({ returnSide: opt.value })}
                    >
                      {opt.label}
                    </ChoiceChip>
                  ))}
                </ChipRow>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Front (mm)"
                    type="number"
                    value={draft.frontMM}
                    onChange={(e) => patch({ frontMM: e.target.value })}
                  />
                  <Input
                    label="Return (mm)"
                    type="number"
                    value={draft.returnMM}
                    onChange={(e) => patch({ returnMM: e.target.value })}
                  />
                </div>
              </>
            )}

            {draft.type === "Front Only" && (
              <>
                <ChipRow label="Style">
                  <ChoiceChip
                    selected={draft.frontOnlyStyle === "panelDoor"}
                    onClick={() => patch({ frontOnlyStyle: "panelDoor" })}
                  >
                    Panel + door
                  </ChoiceChip>
                  <ChoiceChip
                    selected={draft.frontOnlyStyle === "panelDoorPanel"}
                    onClick={() => patch({ frontOnlyStyle: "panelDoorPanel" })}
                  >
                    Panel + door + panel
                  </ChoiceChip>
                </ChipRow>
                {draft.frontOnlyStyle === "panelDoor" && (
                  <>
                    <ChipRow label="Fixed panel side">
                      {SIDES.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          selected={draft.panelSide === opt.value}
                          onClick={() => patch({ panelSide: opt.value })}
                        >
                          {opt.label}
                        </ChoiceChip>
                      ))}
                    </ChipRow>
                    <Input
                      label="Wall to wall (mm)"
                      type="number"
                      value={draft.w2wMM}
                      onChange={(e) => patch({ w2wMM: e.target.value })}
                    />
                  </>
                )}
                {draft.frontOnlyStyle === "panelDoorPanel" && (
                  <>
                    <ChipRow label="Left panel" columns={5}>
                      {SIDE_PANEL_PRESETS.map((mm) => (
                        <ChoiceChip
                          key={`L-${mm}`}
                          selected={draft.leftPanelMM === String(mm)}
                          onClick={() => patch({ leftPanelMM: String(mm) })}
                          className="px-1.5 text-xs"
                        >
                          {mm}
                        </ChoiceChip>
                      ))}
                    </ChipRow>
                    <ChipRow label="Right panel" columns={5}>
                      {SIDE_PANEL_PRESETS.map((mm) => (
                        <ChoiceChip
                          key={`R-${mm}`}
                          selected={draft.rightPanelMM === String(mm)}
                          onClick={() => patch({ rightPanelMM: String(mm) })}
                          className="px-1.5 text-xs"
                        >
                          {mm}
                        </ChoiceChip>
                      ))}
                    </ChipRow>
                    <p className="text-xs text-slate-500">
                      Door {draft.isSliding ? "slide" : `${draft.doorMM} mm`},
                      wall to wall {foW2w || "-"} mm
                    </p>
                  </>
                )}
              </>
            )}

            {draft.type === "Splayed" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Wall A (internal)"
                    value={draft.wallA}
                    onChange={(e) => patch({ wallA: e.target.value })}
                  >
                    {SPLAYED_SIZES.map((s) => (
                      <option key={s.label} value={String(s.internal)}>
                        {s.internal} mm → cut {s.cut}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Wall B (internal)"
                    value={draft.wallB}
                    onChange={(e) => patch({ wallB: e.target.value })}
                  >
                    {SPLAYED_SIZES.map((s) => (
                      <option key={s.label} value={String(s.internal)}>
                        {s.internal} mm → cut {s.cut}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <p className="text-xs text-slate-500">
                  From internal corner out. Door fixed at 662 mm.
                </p>
              </>
            )}

            {draft.type === "Fixed Panel" && (
              <>
                <ChipRow label="Fixed style" columns={3}>
                  {FIXED_STYLES.map((opt) => (
                    <ChoiceChip
                      key={opt.value}
                      selected={draft.fixedStyle === opt.value}
                      onClick={() => patch({ fixedStyle: opt.value })}
                      className="px-2 text-xs sm:text-sm"
                    >
                      {opt.label}
                    </ChoiceChip>
                  ))}
                </ChipRow>
                {draft.fixedStyle === "single" && (
                  <ChipRow label="Panel side">
                    {SIDES.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        selected={draft.panelSide === opt.value}
                        onClick={() => patch({ panelSide: opt.value })}
                      >
                        {opt.label}
                      </ChoiceChip>
                    ))}
                  </ChipRow>
                )}
                {draft.fixedStyle === "panelReturn" ? (
                  <>
                    <ChipRow label="Return side">
                      {RETURN_SIDES.map((opt) => (
                        <ChoiceChip
                          key={opt.value}
                          selected={draft.returnSide === opt.value}
                          onClick={() => patch({ returnSide: opt.value })}
                        >
                          {opt.label}
                        </ChoiceChip>
                      ))}
                    </ChipRow>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Front total (mm)"
                        type="number"
                        value={draft.frontMM}
                        onChange={(e) => patch({ frontMM: e.target.value })}
                      />
                      <Input
                        label="Fixed panel (mm)"
                        type="number"
                        value={draft.panelMM}
                        onChange={(e) => patch({ panelMM: e.target.value })}
                      />
                    </div>
                    <Input
                      label="Return (mm)"
                      type="number"
                      value={draft.returnMM}
                      onChange={(e) => patch({ returnMM: e.target.value })}
                    />
                    <p className="text-xs text-slate-500">
                      Walk{" "}
                      {Math.max(
                        0,
                        (Number(draft.frontMM) || 0) -
                          (Number(draft.panelMM) || 0)
                      ) || "-"}{" "}
                      mm (front - fixed)
                    </p>
                  </>
                ) : (
                  <>
                    <Input
                      label="Wall to wall (mm)"
                      type="number"
                      value={draft.w2wMM}
                      onChange={(e) => patch({ w2wMM: e.target.value })}
                    />
                    <Input
                      label={
                        draft.fixedStyle === "double"
                          ? "Each panel width (mm)"
                          : "Panel width (mm)"
                      }
                      type="number"
                      value={draft.panelMM}
                      onChange={(e) => patch({ panelMM: e.target.value })}
                    />
                  </>
                )}
              </>
            )}
          </FieldSection>

          <FieldSection title="Finish">
            <ChipRow label="Angle height" columns={3}>
              {ANGLE_HEIGHTS.map((h) => (
                <ChoiceChip
                  key={h}
                  selected={draft.angleHeight === h}
                  onClick={() => patch({ angleHeight: h as AngleHeight })}
                >
                  {h} mm
                </ChoiceChip>
              ))}
            </ChipRow>
          </FieldSection>

          {showDoor && (
            <FieldSection title="Door">
              <ChipRow label="Door type">
                <ChoiceChip
                  selected={!draft.isSliding}
                  onClick={() => patch({ isSliding: false })}
                >
                  Hinged
                </ChoiceChip>
                <ChoiceChip
                  selected={draft.isSliding}
                  onClick={() => patch({ isSliding: true })}
                >
                  Sliding
                </ChoiceChip>
              </ChipRow>
              {showSwing && draft.type !== "Splayed" && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <ChipRow label="Door width">
                    {(["662", "762"] as const).map((w) => (
                      <ChoiceChip
                        key={w}
                        selected={draft.doorMM === w}
                        onClick={() => patch({ doorMM: w })}
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
                        onClick={() => patch({ hingeSide: opt.value })}
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
                        onClick={() => patch({ swingDirection: opt.value })}
                      >
                        {opt.label}
                      </ChoiceChip>
                    ))}
                  </ChipRow>
                </div>
              )}
            </FieldSection>
          )}

          {draft.type === "Splayed" && (
            <FieldSection title="Door" description="Fixed 662 mm">
              <ChipRow label="Hinge side">
                {HINGE_SIDES.map((opt) => (
                  <ChoiceChip
                    key={opt.value}
                    selected={draft.hingeSide === opt.value}
                    onClick={() => patch({ hingeSide: opt.value })}
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
                    onClick={() => patch({ swingDirection: opt.value })}
                  >
                    {opt.label}
                  </ChoiceChip>
                ))}
              </ChipRow>
            </FieldSection>
          )}
        </Card>

        <div className="order-first rounded-2xl border border-slate-200 bg-slate-50/40 p-4 lg:order-none lg:sticky lg:top-20 lg:self-start">
          <ScreenDiagram
            type={draft.type}
            frontOnlyStyle={draft.frontOnlyStyle}
            fixedStyle={draft.fixedStyle}
            returnSide={draft.returnSide}
            panelSide={draft.panelSide}
            isSliding={draft.isSliding}
            hingeSide={draft.hingeSide}
            swingDirection={draft.swingDirection}
            angleHeight={draft.angleHeight}
            frontMM={draft.frontMM}
            returnMM={draft.returnMM}
            w2wMM={
              draft.frontOnlyStyle === "panelDoorPanel"
                ? String(foW2w)
                : draft.w2wMM
            }
            leftPanelMM={draft.leftPanelMM}
            rightPanelMM={draft.rightPanelMM}
            panelMM={draft.panelMM}
            doorMM={draft.doorMM}
            wallA={draft.wallA}
            wallB={draft.wallB}
          />
        </div>
      </div>

      <Card className="border-navy/10 bg-gradient-to-br from-white to-cyan-soft/40">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Quote total
            </p>
            <p className="mt-0.5 truncate text-sm text-slate-600">
              {preview?.summary ?? "Complete the options above"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold tracking-tight text-navy">
              {preview ? formatMoney(screenPriceExGst(preview)) : "-"}
            </p>
            {preview && (
              <p className="text-xs text-slate-500">
                ex GST - {formatMoney(preview.priceIncGst)} inc
              </p>
            )}
          </div>
        </div>
      </Card>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700">
          Label (optional)
        </span>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={preview?.summary ?? "Quote label"}
          className={fieldControlClass}
        />
      </label>

      {error && <Notice variant="error">{error}</Notice>}
      {saved && <Notice variant="success">Quote saved.</Notice>}

      <Button
        type="button"
        full
        disabled={loading || !preview}
        onClick={saveQuote}
      >
        {loading ? "Saving..." : "Save quote"}
      </Button>
    </div>
  );
}
