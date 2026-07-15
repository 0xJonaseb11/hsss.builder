"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Builder } from "@/types/database";
import {
  ANGLE_HEIGHTS,
  COLOURS,
  HINGE_SIDES,
  SPLAYED_SIZES,
  SWING_DIRECTIONS,
  type AngleHeight,
  type HingeSide,
  type QuickScreenKey,
  type SwingDirection,
} from "@/lib/constants";
import { calcPrice, formatMoney } from "@/lib/pricing";
import type { QuickQuotePayload } from "@/lib/quotes";
import type { FrontOnlyStyle } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { ChipRow, FieldSection, SelectField, fieldControlClass } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScreenDiagram } from "@/components/screen-diagram";

const SCREEN_OPTIONS: { key: QuickScreenKey; label: string }[] = [
  { key: "frontReturn", label: "Front & Return" },
  { key: "frontOnly", label: "Front Only" },
  { key: "splayed", label: "Splayed" },
  { key: "fixedPanel", label: "Fixed Panel" },
];

export function QuickQuoteForm({ profile }: { profile: Builder }) {
  const router = useRouter();
  const [screenKey, setScreenKey] = useState<QuickScreenKey>("frontReturn");
  const [colour, setColour] = useState("Chrome");
  const [frontMM, setFrontMM] = useState(900);
  const [returnMM, setReturnMM] = useState(900);
  const [w2wMM, setW2wMM] = useState(1200);
  const [panelMM, setPanelMM] = useState(500);
  const [splayA, setSplayA] = useState(0);
  const [splayB, setSplayB] = useState(0);
  const [foStyle, setFoStyle] = useState<FrontOnlyStyle>("panelDoor");
  const [isSliding, setIsSliding] = useState(false);
  const [doorMM, setDoorMM] = useState<662 | 762>(662);
  const [angleHeight, setAngleHeight] = useState<AngleHeight>("42");
  const [hingeSide, setHingeSide] = useState<HingeSide>("left");
  const [swingDirection, setSwingDirection] = useState<SwingDirection>("out");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const showDoor =
    screenKey === "frontReturn" || screenKey === "frontOnly";
  const showSwing = showDoor && !isSliding;

  const price = useMemo(() => {
    const serviceType = profile.service_type;
    if (screenKey === "frontReturn") {
      return calcPrice(
        "frontReturn",
        { frontMM, returnMM, colour, isSliding, doorMM },
        serviceType
      );
    }
    if (screenKey === "frontOnly") {
      const key =
        foStyle === "panelDoorPanel" ? "panelDoorPanel" : "panelDoor";
      return calcPrice(key, { w2wMM, colour, isSliding, doorMM }, serviceType);
    }
    if (screenKey === "splayed") {
      const a = SPLAYED_SIZES[splayA] ?? SPLAYED_SIZES[0];
      const b = SPLAYED_SIZES[splayB] ?? SPLAYED_SIZES[0];
      return calcPrice(
        "splay",
        {
          wallA: a.internal,
          wallB: b.internal,
          colour,
          isSliding: false,
          doorMM: 662,
        },
        serviceType
      );
    }
    return calcPrice(
      "fixedPanel",
      { panelMM, colour, isSliding: false, doorMM: 662 },
      serviceType
    );
  }, [
    screenKey,
    colour,
    frontMM,
    returnMM,
    w2wMM,
    panelMM,
    splayA,
    splayB,
    foStyle,
    isSliding,
    doorMM,
    profile.service_type,
  ]);

  const summary = useMemo(() => {
    const angle = `${angleHeight}mm angle`;
    const doorPart = !showDoor
      ? ""
      : isSliding
        ? "Slide"
        : `${doorMM}mm ${hingeSide === "left" ? "HL" : "HR"} ${swingDirection}`;
    if (screenKey === "frontReturn") {
      return `F&R ${frontMM}×${returnMM} ${doorPart} ${angle} ${colour}`;
    }
    if (screenKey === "frontOnly") {
      return `FO ${w2wMM}mm ${doorPart} ${angle} ${colour}`;
    }
    if (screenKey === "splayed") {
      const a = SPLAYED_SIZES[splayA] ?? SPLAYED_SIZES[0];
      const b = SPLAYED_SIZES[splayB] ?? SPLAYED_SIZES[0];
      return `Splayed ${a.label}×${b.label} ${angle} ${colour}`;
    }
    return `Fixed panel ${panelMM}mm ${angle} ${colour}`;
  }, [
    screenKey,
    frontMM,
    returnMM,
    w2wMM,
    panelMM,
    splayA,
    splayB,
    isSliding,
    doorMM,
    colour,
    angleHeight,
    hingeSide,
    swingDirection,
    showDoor,
  ]);

  function buildPayload(): QuickQuotePayload {
    const config: Record<string, unknown> = { colour, angleHeight };
    if (screenKey === "frontReturn") {
      Object.assign(config, {
        frontMM,
        returnMM,
        isSliding,
        doorMM: isSliding ? null : doorMM,
        hingeSide: showSwing ? hingeSide : null,
        swingDirection: showSwing ? swingDirection : null,
      });
    } else if (screenKey === "frontOnly") {
      Object.assign(config, {
        w2wMM,
        style: foStyle,
        isSliding,
        doorMM: isSliding ? null : doorMM,
        hingeSide: showSwing ? hingeSide : null,
        swingDirection: showSwing ? swingDirection : null,
      });
    } else if (screenKey === "splayed") {
      const a = SPLAYED_SIZES[splayA] ?? SPLAYED_SIZES[0];
      const b = SPLAYED_SIZES[splayB] ?? SPLAYED_SIZES[0];
      Object.assign(config, {
        wallA: a.internal,
        wallB: b.internal,
        sizeA: a.label,
        sizeB: b.label,
      });
    } else {
      Object.assign(config, { panelMM });
    }
    return {
      kind: "quick",
      serviceType: profile.service_type,
      screenKey,
      colour,
      summary,
      priceExGst: price.exGst,
      priceIncGst: price.incGst,
      config,
    };
  }

  async function saveQuote() {
    setLoading(true);
    setError(null);
    setSaved(false);
    const payload = buildPayload();
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteKind: "quick",
        label: label.trim() || summary,
        total: payload.priceExGst,
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

  const diagramType =
    screenKey === "frontReturn"
      ? "Front & Return"
      : screenKey === "frontOnly"
        ? "Front Only"
        : screenKey === "splayed"
          ? "Splayed"
          : "Fixed Panel";

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
              selected={screenKey === opt.key}
              onClick={() => {
                setScreenKey(opt.key);
                setIsSliding(false);
                setDoorMM(662);
              }}
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
              value={colour}
              onChange={(e) => setColour(e.target.value)}
            >
              {COLOURS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
          </FieldSection>

          <FieldSection title="Sizes" description="Enter measurements in mm">
            {screenKey === "frontReturn" && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Front (mm)"
                  type="number"
                  value={frontMM}
                  onChange={(e) => setFrontMM(Number(e.target.value))}
                />
                <Input
                  label="Return (mm)"
                  type="number"
                  value={returnMM}
                  onChange={(e) => setReturnMM(Number(e.target.value))}
                />
              </div>
            )}

            {screenKey === "frontOnly" && (
              <>
                <ChipRow label="Style" columns={3}>
                  {(
                    [
                      ["panelDoor", "Panel + door"],
                      ["panelDoorPanel", "Door + panels"],
                      ["doorCentred", "Door centred"],
                    ] as const
                  ).map(([value, t]) => (
                    <ChoiceChip
                      key={value}
                      selected={foStyle === value}
                      onClick={() => setFoStyle(value)}
                      className="px-2 text-xs sm:text-sm"
                    >
                      {t}
                    </ChoiceChip>
                  ))}
                </ChipRow>
                <Input
                  label="Wall to wall (mm)"
                  type="number"
                  value={w2wMM}
                  onChange={(e) => setW2wMM(Number(e.target.value))}
                />
              </>
            )}

            {screenKey === "splayed" && (
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Wall A"
                  value={splayA}
                  onChange={(e) => setSplayA(Number(e.target.value))}
                >
                  {SPLAYED_SIZES.map((s, i) => (
                    <option key={s.label} value={i}>
                      {s.label} ({s.internal}mm)
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Wall B"
                  value={splayB}
                  onChange={(e) => setSplayB(Number(e.target.value))}
                >
                  {SPLAYED_SIZES.map((s, i) => (
                    <option key={s.label} value={i}>
                      {s.label} ({s.internal}mm)
                    </option>
                  ))}
                </SelectField>
              </div>
            )}

            {screenKey === "fixedPanel" && (
              <Input
                label="Panel width (mm)"
                type="number"
                value={panelMM}
                onChange={(e) => setPanelMM(Number(e.target.value))}
              />
            )}
          </FieldSection>

          <FieldSection title="Finish">
            <ChipRow label="Angle height" columns={3}>
              {ANGLE_HEIGHTS.map((h) => (
                <ChoiceChip
                  key={h}
                  selected={angleHeight === h}
                  onClick={() => setAngleHeight(h)}
                >
                  {h} mm
                </ChoiceChip>
              ))}
            </ChipRow>
          </FieldSection>

          {showDoor && (
            <FieldSection
              title="Door"
              description="Choose hinged or sliding, then set handing"
            >
              <ChipRow label="Door type">
                <ChoiceChip
                  selected={!isSliding}
                  onClick={() => setIsSliding(false)}
                >
                  Hinged
                </ChoiceChip>
                <ChoiceChip
                  selected={isSliding}
                  onClick={() => setIsSliding(true)}
                >
                  Sliding
                </ChoiceChip>
              </ChipRow>

              {showSwing && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <ChipRow label="Door width">
                    {([662, 762] as const).map((w) => (
                      <ChoiceChip
                        key={w}
                        selected={doorMM === w}
                        onClick={() => setDoorMM(w)}
                      >
                        {w} mm
                      </ChoiceChip>
                    ))}
                  </ChipRow>
                  <ChipRow label="Hinge side">
                    {HINGE_SIDES.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        selected={hingeSide === opt.value}
                        onClick={() => setHingeSide(opt.value)}
                      >
                        {opt.label}
                      </ChoiceChip>
                    ))}
                  </ChipRow>
                  <ChipRow label="Door swing">
                    {SWING_DIRECTIONS.map((opt) => (
                      <ChoiceChip
                        key={opt.value}
                        selected={swingDirection === opt.value}
                        onClick={() => setSwingDirection(opt.value)}
                      >
                        {opt.label}
                      </ChoiceChip>
                    ))}
                  </ChipRow>
                </div>
              )}
            </FieldSection>
          )}
        </Card>

        <div className="order-first rounded-2xl border border-slate-200 bg-slate-50/40 p-4 lg:order-none lg:sticky lg:top-20 lg:self-start">
          <ScreenDiagram
            type={diagramType}
            frontOnlyStyle={foStyle}
            isSliding={isSliding}
            hingeSide={hingeSide}
            swingDirection={swingDirection}
            angleHeight={angleHeight}
            frontMM={String(frontMM)}
            returnMM={String(returnMM)}
            w2wMM={String(w2wMM)}
            panelMM={String(panelMM)}
            wallA={String(
              (SPLAYED_SIZES[splayA] ?? SPLAYED_SIZES[0]).internal
            )}
            wallB={String(
              (SPLAYED_SIZES[splayB] ?? SPLAYED_SIZES[0]).internal
            )}
          />
        </div>
      </div>

      <Card className="border-navy/10 bg-gradient-to-br from-white to-cyan-soft/40">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Quote total
            </p>
            <p className="mt-0.5 truncate text-sm text-slate-600">{summary}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold tracking-tight text-navy">
              {formatMoney(price.exGst)}
            </p>
            <p className="text-xs text-slate-500">
              ex GST · {formatMoney(price.incGst)} inc
            </p>
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
          placeholder={summary}
          className={fieldControlClass}
        />
      </label>

      {error && <Notice variant="error">{error}</Notice>}
      {saved && <Notice variant="success">Quote saved.</Notice>}

      <Button type="button" full disabled={loading} onClick={saveQuote}>
        {loading ? "Saving..." : "Save quote"}
      </Button>
    </div>
  );
}
