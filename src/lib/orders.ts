import type {
  AngleHeight,
  FixedStyle,
  HingeSide,
  Side,
  SwingDirection,
} from "@/lib/constants";
import { splayedCutForInternal } from "@/lib/constants";
import { calcPrice } from "@/lib/pricing";
import type { ServiceType } from "@/types/database";

export const SCREEN_TYPES = [
  "Front & Return",
  "Front Only",
  "Splayed",
  "Fixed Panel",
] as const;

export type ScreenType = (typeof SCREEN_TYPES)[number];

export type FrontOnlyStyle = "panelDoor" | "panelDoorPanel";

export type OrderScreenPayload = {
  type: ScreenType;
  colour: string;
  locationLabel: string;
  summary: string;
  priceExGst?: number;
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
  returnSide: Side;
  w2wMM: string;
  wallA: string;
  wallB: string;
  panelMM: string;
  frontOnlyStyle: FrontOnlyStyle;
  panelSide: Side;
  leftPanelMM: string;
  rightPanelMM: string;
  fixedStyle: FixedStyle;
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
    returnSide: "left",
    w2wMM: "1200",
    wallA: "900",
    wallB: "900",
    panelMM: "900",
    frontOnlyStyle: "panelDoor",
    panelSide: "left",
    leftPanelMM: "350",
    rightPanelMM: "550",
    fixedStyle: "single",
    isSliding: false,
    doorMM: "662",
    angleHeight: "42",
    hingeSide: "left",
    swingDirection: "out",
  };
}

function hasHingedDoor(draft: ScreenDraft) {
  if (draft.type === "Splayed") return true;
  return (
    (draft.type === "Front & Return" || draft.type === "Front Only") &&
    !draft.isSliding
  );
}

function angleLabel(height: AngleHeight) {
  return `${height}mm angle`;
}

function swingLabel(draft: ScreenDraft) {
  if (draft.type === "Splayed") {
    const hinge = draft.hingeSide === "left" ? "HL" : "HR";
    const swing = draft.swingDirection === "out" ? "out" : "in";
    return `662mm ${hinge} ${swing}`;
  }
  if (!hasHingedDoor(draft)) return draft.isSliding ? "Slide" : "";
  const hinge = draft.hingeSide === "left" ? "HL" : "HR";
  const swing = draft.swingDirection === "out" ? "out" : "in";
  return `${draft.doorMM}mm ${hinge} ${swing}`;
}

export function frontOnlyW2w(draft: ScreenDraft): number {
  if (draft.frontOnlyStyle === "panelDoorPanel") {
    const left = Number(draft.leftPanelMM) || 0;
    const right = Number(draft.rightPanelMM) || 0;
    const door = draft.isSliding ? 662 : Number(draft.doorMM) || 662;
    return left + door + right;
  }
  return Number(draft.w2wMM) || 0;
}

export function screenDraftToPayload(
  draft: ScreenDraft,
  serviceType: ServiceType
): OrderScreenPayload | { error: string } {
  const colour = draft.colour;
  const angleHeight = draft.angleHeight;
  const hingeSide = draft.hingeSide;
  const swingDirection = draft.swingDirection;

  if (draft.type === "Front & Return") {
    const frontMM = Number(draft.frontMM);
    const returnMM = Number(draft.returnMM);
    if (!frontMM || !returnMM) return { error: "Enter front and return sizes." };
    const doorMM = draft.isSliding ? undefined : Number(draft.doorMM);
    const price = calcPrice(
      "frontReturn",
      { frontMM, returnMM, colour, isSliding: draft.isSliding, doorMM },
      serviceType
    );
    const doorPart = draft.isSliding ? "Slide" : swingLabel(draft);
    const ret = draft.returnSide === "left" ? "LH ret" : "RH ret";
    return {
      type: draft.type,
      colour,
      locationLabel: draft.locationLabel,
      summary: `F&R ${ret} ${frontMM}×${returnMM} ${doorPart} ${angleLabel(angleHeight)} ${colour}`,
      priceExGst: price.exGst,
      priceIncGst: price.incGst,
      config: {
        frontMM,
        returnMM,
        returnSide: draft.returnSide,
        isSliding: draft.isSliding,
        doorMM: doorMM ?? null,
        angleHeight,
        hingeSide: draft.isSliding ? null : hingeSide,
        swingDirection: draft.isSliding ? null : swingDirection,
      },
    };
  }

  if (draft.type === "Front Only") {
    const doorMM = draft.isSliding ? undefined : Number(draft.doorMM);
    if (draft.frontOnlyStyle === "panelDoorPanel") {
      const leftPanelMM = Number(draft.leftPanelMM);
      const rightPanelMM = Number(draft.rightPanelMM);
      if (!leftPanelMM || !rightPanelMM)
        return { error: "Enter left and right panel sizes." };
      const w2wMM = frontOnlyW2w(draft);
      const price = calcPrice(
        "panelDoorPanel",
        { w2wMM, colour, isSliding: draft.isSliding, doorMM },
        serviceType
      );
      const doorPart = draft.isSliding ? "Slide" : swingLabel(draft);
      return {
        type: draft.type,
        colour,
        locationLabel: draft.locationLabel,
        summary: `FO L${leftPanelMM}+R${rightPanelMM} ${doorPart} ${angleLabel(angleHeight)} ${colour}`,
        priceExGst: price.exGst,
        priceIncGst: price.incGst,
        config: {
          style: "panelDoorPanel",
          leftPanelMM,
          rightPanelMM,
          w2wMM,
          isSliding: draft.isSliding,
          doorMM: doorMM ?? null,
          angleHeight,
          hingeSide: draft.isSliding ? null : hingeSide,
          swingDirection: draft.isSliding ? null : swingDirection,
        },
      };
    }

    const w2wMM = Number(draft.w2wMM);
    if (!w2wMM) return { error: "Enter wall-to-wall size." };
    const price = calcPrice(
      "panelDoor",
      { w2wMM, colour, isSliding: draft.isSliding, doorMM },
      serviceType
    );
    const doorPart = draft.isSliding ? "Slide" : swingLabel(draft);
    const panel = draft.panelSide === "left" ? "panel LHS" : "panel RHS";
    return {
      type: draft.type,
      colour,
      locationLabel: draft.locationLabel,
      summary: `FO ${panel} ${w2wMM}mm ${doorPart} ${angleLabel(angleHeight)} ${colour}`,
      priceExGst: price.exGst,
      priceIncGst: price.incGst,
      config: {
        style: "panelDoor",
        w2wMM,
        panelSide: draft.panelSide,
        isSliding: draft.isSliding,
        doorMM: doorMM ?? null,
        angleHeight,
        hingeSide: draft.isSliding ? null : hingeSide,
        swingDirection: draft.isSliding ? null : swingDirection,
      },
    };
  }

  if (draft.type === "Splayed") {
    const wallA = Number(draft.wallA);
    const wallB = Number(draft.wallB);
    if (!wallA || !wallB) return { error: "Enter both wall sizes." };
    const cutA = splayedCutForInternal(wallA);
    const cutB = splayedCutForInternal(wallB);
    const price = calcPrice(
      "splay",
      { wallA, wallB, colour, isSliding: false, doorMM: 662 },
      serviceType
    );
    return {
      type: draft.type,
      colour,
      locationLabel: draft.locationLabel,
      summary: `Splayed ${wallA}×${wallB} door 662 ${swingLabel(draft)} ${angleLabel(angleHeight)} ${colour}`,
      priceExGst: price.exGst,
      priceIncGst: price.incGst,
      config: {
        wallA,
        wallB,
        cutA,
        cutB,
        doorMM: 662,
        angleHeight,
        hingeSide,
        swingDirection,
      },
    };
  }

  const panelMM = Number(draft.panelMM);
  if (!panelMM) return { error: "Enter panel width." };

  const isPanelReturn = draft.fixedStyle === "panelReturn";
  const returnMM = isPanelReturn ? Number(draft.returnMM) : undefined;
  if (isPanelReturn && !returnMM) return { error: "Enter return size." };

  const frontMM = isPanelReturn ? Number(draft.frontMM) : undefined;
  if (isPanelReturn && !frontMM) return { error: "Enter front total size." };
  if (isPanelReturn && frontMM! <= panelMM)
    return { error: "Front total must be larger than the fixed panel." };

  const w2wMM = !isPanelReturn ? Number(draft.w2wMM) : undefined;
  if (!isPanelReturn && !w2wMM) return { error: "Enter wall-to-wall size." };

  const price = calcPrice(
    "fixedPanel",
    { panelMM, colour, isSliding: false, doorMM: 662 },
    serviceType
  );

  let summary = "";
  if (draft.fixedStyle === "single") {
    summary = `Fixed ${draft.panelSide === "left" ? "LHS" : "RHS"} ${panelMM}mm ${w2wMM}mm w2w ${angleLabel(angleHeight)} ${colour}`;
  } else if (draft.fixedStyle === "double") {
    summary = `Fixed double ${panelMM}mm ${w2wMM}mm w2w ${angleLabel(angleHeight)} ${colour}`;
  } else {
    const walk = frontMM! - panelMM;
    summary = `Fixed + return ${panelMM}×${returnMM} front ${frontMM} walk ${walk} ${angleLabel(angleHeight)} ${colour}`;
  }

  return {
    type: draft.type,
    colour,
    locationLabel: draft.locationLabel,
    summary,
    priceExGst: price.exGst,
    priceIncGst: price.incGst,
    config: {
      fixedStyle: draft.fixedStyle,
      panelMM,
      panelSide: draft.fixedStyle === "single" ? draft.panelSide : null,
      returnMM: returnMM ?? null,
      returnSide: isPanelReturn ? draft.returnSide : null,
      frontMM: frontMM ?? null,
      w2wMM: w2wMM ?? null,
      angleHeight,
    },
  };
}

export function orderTotal(screens: OrderScreenPayload[]) {
  return screens.reduce((sum, s) => sum + screenPriceExGst(s), 0);
}

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

function parseSide(value: unknown): Side {
  return value === "right" ? "right" : "left";
}

function parseSwingDirection(value: unknown): SwingDirection {
  return value === "in" ? "in" : "out";
}

function parseFixedStyle(value: unknown): FixedStyle {
  if (value === "double" || value === "panelReturn") return value;
  return "single";
}

export function screenPayloadToDraft(screen: OrderScreenPayload): ScreenDraft {
  const draft = emptyScreenDraft();
  draft.type = screen.type;
  draft.colour = screen.colour;
  draft.locationLabel = screen.locationLabel;
  const config = screen.config;

  draft.angleHeight = parseAngleHeight(config.angleHeight);
  draft.hingeSide = parseSide(config.hingeSide);
  draft.swingDirection = parseSwingDirection(config.swingDirection);
  draft.returnSide = parseSide(config.returnSide);
  draft.panelSide = parseSide(config.panelSide);

  if (screen.type === "Front & Return") {
    draft.frontMM = String(config.frontMM ?? 900);
    draft.returnMM = String(config.returnMM ?? 900);
    draft.isSliding = Boolean(config.isSliding);
    if (config.doorMM === 762) draft.doorMM = "762";
  } else if (screen.type === "Front Only") {
    draft.frontOnlyStyle =
      config.style === "panelDoorPanel" ? "panelDoorPanel" : "panelDoor";
    draft.w2wMM = String(config.w2wMM ?? 1200);
    draft.leftPanelMM = String(config.leftPanelMM ?? 350);
    draft.rightPanelMM = String(config.rightPanelMM ?? 550);
    draft.isSliding = Boolean(config.isSliding);
    if (config.doorMM === 762) draft.doorMM = "762";
  } else if (screen.type === "Splayed") {
    draft.wallA = String(config.wallA ?? 900);
    draft.wallB = String(config.wallB ?? 900);
  } else {
    draft.fixedStyle = parseFixedStyle(config.fixedStyle);
    draft.panelMM = String(config.panelMM ?? 900);
    draft.w2wMM = String(config.w2wMM ?? 1200);
    if (config.frontMM != null) draft.frontMM = String(config.frontMM);
    if (config.returnMM != null) draft.returnMM = String(config.returnMM);
  }

  return draft;
}
