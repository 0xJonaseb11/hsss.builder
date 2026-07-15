import type { ServiceType } from "@/types/database";
import type { OrderPayload, OrderScreenPayload } from "@/lib/orders";

export type QuickQuotePayload = {
  kind: "quick";
  serviceType: ServiceType;
  screenKey: "frontReturn" | "frontOnly" | "splayed" | "fixedPanel";
  colour: string;
  summary: string;
  priceExGst?: number;
  priceIncGst: number;
  config: Record<string, unknown>;
};

export type OrderQuotePayload = OrderPayload & {
  kind: "order";
  jobRef?: string;
};

export type QuotePayload = QuickQuotePayload | OrderQuotePayload;

export function makeQuoteReference() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `QUOTE-${n}`;
}

export function isQuickQuotePayload(
  payload: Record<string, unknown>
): payload is QuickQuotePayload {
  return payload.kind === "quick";
}

export function isOrderQuotePayload(
  payload: Record<string, unknown>
): payload is OrderQuotePayload {
  return payload.kind === "order";
}

export function quoteLabel(payload: QuotePayload, fallback: string) {
  if (payload.kind === "quick") return payload.summary;
  if (payload.jobRef) return payload.jobRef;
  const screens = payload.screens?.length ?? 0;
  return screens > 0 ? `${screens} screen${screens === 1 ? "" : "s"}` : fallback;
}

export function screenFromQuickQuote(
  payload: QuickQuotePayload
): OrderScreenPayload {
  const typeMap = {
    frontReturn: "Front & Return",
    frontOnly: "Front Only",
    splayed: "Splayed",
    fixedPanel: "Fixed Panel",
  } as const;
  const priceExGst =
    typeof payload.priceExGst === "number"
      ? payload.priceExGst
      : Math.round((payload.priceIncGst / 1.1) * 100) / 100;
  return {
    type: typeMap[payload.screenKey],
    colour: payload.colour,
    locationLabel: "",
    summary: payload.summary,
    priceExGst,
    priceIncGst: payload.priceIncGst,
    config: payload.config,
  };
}
