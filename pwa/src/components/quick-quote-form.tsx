"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Builder } from "@/types/database";
import type { QuickScreenKey } from "@/lib/constants";
import { COLOURS, SPLAYED_SIZES } from "@/lib/constants";
import { calcPrice, formatMoney } from "@/lib/pricing";
import type { QuickQuotePayload } from "@/lib/quotes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";

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
  const [foStyle, setFoStyle] = useState<0 | 1>(0);
  const [isSliding, setIsSliding] = useState(false);
  const [doorMM, setDoorMM] = useState<662 | 762>(662);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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
      const key = foStyle === 0 ? "panelDoor" : "panelDoorPanel";
      return calcPrice(key, { w2wMM, colour, isSliding, doorMM }, serviceType);
    }
    if (screenKey === "splayed") {
      const a = SPLAYED_SIZES[splayA] ?? SPLAYED_SIZES[0];
      const b = SPLAYED_SIZES[splayB] ?? SPLAYED_SIZES[0];
      return calcPrice(
        "splay",
        { wallA: a.internal, wallB: b.internal, colour, isSliding: false, doorMM: 662 },
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
    if (screenKey === "frontReturn") {
      return `F&R ${frontMM}×${returnMM} ${isSliding ? "Slide" : `${doorMM}mm`} ${colour}`;
    }
    if (screenKey === "frontOnly") {
      return `FO ${w2wMM}mm ${isSliding ? "Slide" : `${doorMM}mm`} ${colour}`;
    }
    if (screenKey === "splayed") {
      const a = SPLAYED_SIZES[splayA] ?? SPLAYED_SIZES[0];
      const b = SPLAYED_SIZES[splayB] ?? SPLAYED_SIZES[0];
      return `Splayed ${a.label}×${b.label} ${colour}`;
    }
    return `Fixed panel ${panelMM}mm ${colour}`;
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
  ]);

  function buildPayload(): QuickQuotePayload {
    const config: Record<string, unknown> = { colour };
    if (screenKey === "frontReturn") {
      Object.assign(config, { frontMM, returnMM, isSliding, doorMM: isSliding ? null : doorMM });
    } else if (screenKey === "frontOnly") {
      Object.assign(config, {
        w2wMM,
        style: foStyle === 0 ? "panelDoor" : "panelDoorPanel",
        isSliding,
        doorMM: isSliding ? null : doorMM,
      });
    } else if (screenKey === "splayed") {
      const a = SPLAYED_SIZES[splayA] ?? SPLAYED_SIZES[0];
      const b = SPLAYED_SIZES[splayB] ?? SPLAYED_SIZES[0];
      Object.assign(config, { wallA: a.internal, wallB: b.internal, sizeA: a.label, sizeB: b.label });
    } else {
      Object.assign(config, { panelMM });
    }
    return {
      kind: "quick",
      serviceType: profile.service_type,
      screenKey,
      colour,
      summary,
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
        total: payload.priceIncGst,
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

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-navy">Screen type</h2>
        <div className="grid grid-cols-2 gap-2">
          {SCREEN_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setScreenKey(opt.key);
                setIsSliding(false);
                setDoorMM(662);
              }}
              className={`rounded-md border px-3 py-2.5 text-sm font-medium ${
                screenKey === opt.key
                  ? "border-navy bg-cyan/20 text-navy"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-600">
            Colour
          </span>
          <select
            value={colour}
            onChange={(e) => setColour(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
          >
            {COLOURS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {screenKey === "frontReturn" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Front (mm)
              </span>
              <input
                type="number"
                value={frontMM}
                onChange={(e) => setFrontMM(Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Return (mm)
              </span>
              <input
                type="number"
                value={returnMM}
                onChange={(e) => setReturnMM(Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5"
              />
            </label>
          </div>
        )}

        {screenKey === "frontOnly" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {["Single door", "Door + panels"].map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFoStyle(i as 0 | 1)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium ${
                    foStyle === i
                      ? "border-navy bg-cyan/20 text-navy"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Wall to wall (mm)
              </span>
              <input
                type="number"
                value={w2wMM}
                onChange={(e) => setW2wMM(Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5"
              />
            </label>
          </>
        )}

        {screenKey === "splayed" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Wall A
              </span>
              <select
                value={splayA}
                onChange={(e) => setSplayA(Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm"
              >
                {SPLAYED_SIZES.map((s, i) => (
                  <option key={s.label} value={i}>
                    {s.label} ({s.internal}mm)
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Wall B
              </span>
              <select
                value={splayB}
                onChange={(e) => setSplayB(Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm"
              >
                {SPLAYED_SIZES.map((s, i) => (
                  <option key={s.label} value={i}>
                    {s.label} ({s.internal}mm)
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {screenKey === "fixedPanel" && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">
              Panel width (mm)
            </span>
            <input
              type="number"
              value={panelMM}
              onChange={(e) => setPanelMM(Number(e.target.value))}
              className="w-full rounded-md border border-slate-200 px-3 py-2.5"
            />
          </label>
        )}

        {(screenKey === "frontReturn" || screenKey === "frontOnly") && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isSliding}
                onChange={(e) => setIsSliding(e.target.checked)}
              />
              Sliding door
            </label>
            {!isSliding && (
              <div>
                <span className="mb-1 block text-sm font-medium text-slate-600">
                  Door width
                </span>
                <select
                  value={doorMM}
                  onChange={(e) => setDoorMM(Number(e.target.value) as 662 | 762)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value={662}>662 mm</option>
                  <option value={762}>762 mm</option>
                </select>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <p className="text-sm text-slate-600">{summary}</p>
        <p className="mt-2 text-2xl font-semibold text-navy">
          {formatMoney(price.incGst)}{" "}
          <span className="text-sm font-normal text-slate-500">inc GST</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Ex GST {formatMoney(price.exGst)}
        </p>
      </Card>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-600">
          Label (optional)
        </span>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={summary}
          className="w-full rounded-md border border-slate-200 px-3 py-2.5"
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
