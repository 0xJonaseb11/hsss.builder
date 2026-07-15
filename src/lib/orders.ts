import type { AngleHeight, HingeSide, SwingDirection } from "@/lib/constants";
import { calcPrice } from "@/lib/pricing";
import type { ServiceType } from "@/types/database";

export const SCREEN_TYPES = [
  "Front & Return",
  "Front Only",
  "Splayed",
  "Fixed Panel",
] as const;

export type ScreenType = (typeof SCREEN_TYPES)[number];

export type FrontOnlyStyle = "panelDoor" | "panelDoorPanel" | "doorCentred";

export type OrderScreenPayload = {
  type: ScreenType;
  colour: string;
  locationLabel: string;
  summary: string;
  /** Primary price for builders (ex GST). Optional on legacy rows. */
  priceExGst?: number;
  /** Kept for email / accounting; not primary in UI. */
  priceIncGst: number;
  config: Record<string, unknown>;
};

export type OrderPayload = {
  serviceType: ServiceType;
  delivery: {
    address: string;
    suburb: string;
    state: string;
  };
  siteContact: {
    name: string;
    phone: string;
  } | null;
  notes: string | null;
  deliveryDates: {
    hobDate?: string;
    glassDate?: string;
    deliveryDate?: string;
  };
  screens: OrderScreenPayload[];
};

export type CreateOrderBody = {
  sample?: boolean;
  jobRef?: string;
  payload?: OrderPayload;
};

export function makeReference() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `HSSS-${n}`;
}

export function makeJobRef() {
  return `JOB-${Date.now().toString().slice(-6)}`;
}

export type ScreenDraft = {
  id: string;
  type: ScreenType;
  colour: string;
  locationLabel: string;
  frontMM: string;
  returnMM: string;
  w2wMM: string;
  wallA: string;
  wallB: string;
  panelMM: string;
  frontOnlyStyle: FrontOnlyStyle;
  isSliding: boolean;
  doorMM: "662" | "762";
  angleHeight: AngleHeight;
  hingeSide: HingeSide;
  swingDirection: SwingDirection;
};

export function emptyScreenDraft(): ScreenDraft {
  return {
    id: crypto.randomUUID(),
    type: "Front & Return",
    colour: "Chrome",
    locationLabel: "",
    frontMM: "900",
    returnMM: "900",
    w2wMM: "900",
    wallA: "900",
    wallB: "900",
    panelMM: "900",
    frontOnlyStyle: "panelDoor",
    isSliding: false,
    doorMM: "662",
    angleHeight: "42",
    hingeSide: "left",
    swingDirection: "out",
  };
}

function hasHingedDoor(draft: ScreenDraft) {
  return (
    (draft.type === "Front & Return" || draft.type === "Front Only") &&
    !draft.isSliding
  );
}

function angleLabel(height: AngleHeight) {
  return `${height}mm angle`;
}

function swingLabel(draft: ScreenDraft) {
  if (!hasHingedDoor(draft)) return draft.isSliding ? "Slide" : "";
  const hinge = draft.hingeSide === "left" ? "HL" : "HR";
  const swing = draft.swingDirection === "out" ? "out" : "in";
  return `${draft.doorMM}mm ${hinge} ${swing}`;
}

export function screenDraftToPayload(
  draft: ScreenDraft,
  serviceType: ServiceType
): OrderScreenPayload | { error: string } {
  const doorMM = draft.isSliding ? undefined : Number(draft.doorMM);
  const colour = draft.colour;
  const angleHeight = draft.angleHeight;
  const hingeSide = draft.hingeSide;
  const swingDirection = draft.swingDirection;
  const doorMeta = hasHingedDoor(draft)
    ? { hingeSide, swingDirection }
    : { hingeSide: null, swingDirection: null };

  if (draft.type === "Front & Return") {
    const frontMM = Number(draft.frontMM);
    const returnMM = Number(draft.returnMM);
    if (!frontMM || !returnMM) return { error: "Enter front and return sizes." };
    const price = calcPrice(
      "frontReturn",
      { frontMM, returnMM, colour, isSliding: draft.isSliding, doorMM },
      serviceType
    );
    const doorPart = draft.isSliding ? "Slide" : swingLabel(draft);
    return {
      type: draft.type,
      colour,
      locationLabel: draft.locationLabel,
      summary: `F&R ${frontMM}×${returnMM} ${doorPart} ${angleLabel(angleHeight)} ${colour}`,
      priceExGst: price.exGst,
      priceIncGst: price.incGst,
      config: {
        frontMM,
        returnMM,
        isSliding: draft.isSliding,
        doorMM: doorMM ?? null,
        angleHeight,
        ...doorMeta,
      },
    };
  }

  if (draft.type === "Front Only") {
    const w2wMM = Number(draft.w2wMM);
    if (!w2wMM) return { error: "Enter wall-to-wall size." };
    const priceKey =
      draft.frontOnlyStyle === "panelDoorPanel"
        ? "panelDoorPanel"
        : "panelDoor";
    const price = calcPrice(
      priceKey,
      { w2wMM, colour, isSliding: draft.isSliding, doorMM },
      serviceType
    );
    const doorPart = draft.isSliding ? "Slide" : swingLabel(draft);
    return {
      type: draft.type,
      colour,
      locationLabel: draft.locationLabel,
      summary: `FO ${w2wMM}mm ${doorPart} ${angleLabel(angleHeight)} ${colour}`,
      priceExGst: price.exGst,
      priceIncGst: price.incGst,
      config: {
        w2wMM,
        style: draft.frontOnlyStyle,
        isSliding: draft.isSliding,
        doorMM: doorMM ?? null,
        angleHeight,
        ...doorMeta,
      },
    };
  }

  if (draft.type === "Splayed") {
    const wallA = Number(draft.wallA);
    const wallB = Number(draft.wallB);
    if (!wallA || !wallB) return { error: "Enter both wall sizes." };
    const price = calcPrice(
      "splay",
      { wallA, wallB, colour, isSliding: false, doorMM: 662 },
      serviceType
    );
    return {
      type: draft.type,
      colour,
      locationLabel: draft.locationLabel,
      summary: `Splayed ${wallA}×${wallB} ${angleLabel(angleHeight)} ${colour}`,
      priceExGst: price.exGst,
      priceIncGst: price.incGst,
      config: { wallA, wallB, angleHeight },
    };
  }

  const panelMM = Number(draft.panelMM);
  if (!panelMM) return { error: "Enter panel width." };
  const price = calcPrice(
    "fixedPanel",
    { panelMM, colour, isSliding: false, doorMM: 662 },
    serviceType
  );
  return {
    type: draft.type,
    colour,
    locationLabel: draft.locationLabel,
    summary: `Fixed panel ${panelMM}mm ${angleLabel(angleHeight)} ${colour}`,
    priceExGst: price.exGst,
    priceIncGst: price.incGst,
    config: { panelMM, angleHeight },
  };
}

/** Totals are always ex GST for builders. */
export function orderTotal(screens: OrderScreenPayload[]) {
  return screens.reduce((sum, s) => sum + screenPriceExGst(s), 0);
}

/** Resolve ex GST for new and legacy payloads. */
export function screenPriceExGst(screen: {
  priceExGst?: number;
  priceIncGst?: number;
}) {
  if (typeof screen.priceExGst === "number") return screen.priceExGst;
  if (typeof screen.priceIncGst === "number")
    return Math.round((screen.priceIncGst / 1.1) * 100) / 100;
  return 0;
}

export type InitialOrderData = {
  jobRef?: string;
  address?: string;
  suburb?: string;
  state?: string;
  notes?: string;
  siteContactName?: string;
  siteContactPhone?: string;
  hobDate?: string;
  glassDate?: string;
  deliveryDate?: string;
  screens?: ScreenDraft[];
};

function parseAngleHeight(value: unknown): AngleHeight {
  if (value === "21" || value === "42" || value === "60") return value;
  return "42";
}

function parseHingeSide(value: unknown): HingeSide {
  return value === "right" ? "right" : "left";
}

function parseSwingDirection(value: unknown): SwingDirection {
  return value === "in" ? "in" : "out";
}

export function screenPayloadToDraft(screen: OrderScreenPayload): ScreenDraft {
  const draft = emptyScreenDraft();
  draft.type = screen.type;
  draft.colour = screen.colour;
  draft.locationLabel = screen.locationLabel;
  const config = screen.config;

  draft.angleHeight = parseAngleHeight(config.angleHeight);
  draft.hingeSide = parseHingeSide(config.hingeSide);
  draft.swingDirection = parseSwingDirection(config.swingDirection);

  if (screen.type === "Front & Return") {
    draft.frontMM = String(config.frontMM ?? 900);
    draft.returnMM = String(config.returnMM ?? 900);
    draft.isSliding = Boolean(config.isSliding);
    if (config.doorMM === 762) draft.doorMM = "762";
  } else if (screen.type === "Front Only") {
    draft.w2wMM = String(config.w2wMM ?? 900);
    draft.frontOnlyStyle =
      config.style === "panelDoorPanel"
        ? "panelDoorPanel"
        : config.style === "doorCentred"
          ? "doorCentred"
          : "panelDoor";
    draft.isSliding = Boolean(config.isSliding);
    if (config.doorMM === 762) draft.doorMM = "762";
  } else if (screen.type === "Splayed") {
    draft.wallA = String(config.wallA ?? 900);
    draft.wallB = String(config.wallB ?? 900);
  } else {
    draft.panelMM = String(config.panelMM ?? 900);
  }

  return draft;
}
