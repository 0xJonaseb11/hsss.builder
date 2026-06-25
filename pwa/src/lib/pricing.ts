import type { ServiceType } from "@/types/database";

const PRICING = {
  supplyInstall: {
    frontReturn: { rate: 310, min: 1123.0 },
    splay: { rate: 310, min: 1123.0 },
    panelDoor: {
      table: {
        900: 850.82,
        1000: 881.1,
        1100: 915.44,
        1200: 949.78,
        1300: 984.13,
        1400: 1018.47,
        1500: 1052.81,
      },
      min: 850.82,
      minWidth: 900,
      incrementAbove: 1500,
      increment: 34.34,
    },
    panelDoorPanel: {
      table: {
        1000: 973.91,
        1100: 995.89,
        1200: 1022.75,
        1300: 1077.49,
        1400: 1124.94,
        1500: 1153.68,
        1600: 1161.39,
        1700: 1209.66,
        1800: 1217.71,
      },
      min: 973.91,
      minWidth: 1000,
      incrementAbove: 1800,
      increment: 48.0,
    },
    fixedPanel: { small: 704.58, large: 930.33, smallMax: 985, largeMin: 1035, largeMax: 1485 },
    colourSurcharge: {
      Chrome: { multi: 0, fixed: 0 },
      Black: { multi: 115, fixed: 65 },
      "Brushed Nickel": { multi: 115, fixed: 65 },
      "Brushed Brass": { multi: 220, fixed: 120 },
    },
  },
  supplyOnly: {
    frontReturn: { rate: 215, min: 750.0 },
    splay: { rate: 215, min: 750.0 },
    panelDoor: {
      table: {
        900: 557.13,
        1000: 587.82,
        1100: 622.15,
        1200: 656.5,
        1300: 690.83,
        1400: 725.17,
        1500: 759.51,
      },
      min: 557.13,
      minWidth: 900,
      incrementAbove: 1500,
      increment: 34.34,
    },
    panelDoorPanel: {
      table: {
        1000: 680.63,
        1100: 702.19,
        1200: 776.96,
        1300: 783.79,
        1400: 836.04,
        1500: 854.86,
        1600: 868.11,
        1700: 897.11,
        1800: 924.42,
      },
      min: 680.63,
      minWidth: 1000,
      incrementAbove: 1800,
      increment: 48.0,
    },
    fixedPanel: { small: 504.21, large: 649.86, smallMax: 985, largeMin: 1035, largeMax: 1485 },
    colourSurcharge: {
      Chrome: { multi: 0, fixed: 0 },
      Black: { multi: 110, fixed: 85 },
      "Brushed Nickel": { multi: 110, fixed: 85 },
      "Brushed Brass": { multi: 215, fixed: 170 },
    },
  },
} as const;

export type PriceBreakdown = {
  base: number;
  colourAdd: number;
  doorAdd: number;
  exGst: number;
  incGst: number;
};

type CalcConfig = {
  frontMM?: number;
  returnMM?: number;
  wallA?: number;
  wallB?: number;
  w2wMM?: number;
  panelMM?: number;
  colour: string;
  isSliding?: boolean;
  doorMM?: number;
};

export function calcPrice(
  screenType: "frontReturn" | "splay" | "panelDoor" | "panelDoorPanel" | "fixedPanel",
  config: CalcConfig,
  customerType: ServiceType
): PriceBreakdown {
  const p =
    customerType === "Supply & Install"
      ? PRICING.supplyInstall
      : PRICING.supplyOnly;
  let base = 0;
  let isFixed = false;

  if (screenType === "frontReturn") {
    const m2 = (((config.frontMM ?? 0) + (config.returnMM ?? 0)) / 1000) * 2.0;
    base = Math.max(p.frontReturn.min, m2 * p.frontReturn.rate);
  } else if (screenType === "splay") {
    const m2 = (((config.wallA ?? 0) + (config.wallB ?? 0)) / 1000) * 2.0;
    base = Math.max(p.splay.min, m2 * p.splay.rate);
  } else if (screenType === "panelDoor" || screenType === "panelDoorPanel") {
    const tbl = p[screenType];
    const w = config.w2wMM ?? 0;
    if (w <= tbl.minWidth) base = tbl.min;
    else if (w <= tbl.incrementAbove) {
      const r = Math.ceil(w / 100) * 100;
      base = tbl.table[r as keyof typeof tbl.table] ?? tbl.min;
    } else {
      const extra = Math.ceil((w - tbl.incrementAbove) / 100);
      base = tbl.table[tbl.incrementAbove as keyof typeof tbl.table] + extra * tbl.increment;
    }
  } else if (screenType === "fixedPanel") {
    isFixed = true;
    const w = config.panelMM ?? 0;
    if (w <= p.fixedPanel.smallMax) base = p.fixedPanel.small;
    else if (w >= p.fixedPanel.largeMin && w <= p.fixedPanel.largeMax)
      base = p.fixedPanel.large;
    else base = p.fixedPanel.small;
  }

  const cs =
    p.colourSurcharge[config.colour as keyof typeof p.colourSurcharge] ??
    ({ multi: 0, fixed: 0 } as const);
  const colourAdd = isFixed ? cs.fixed : cs.multi;
  let doorAdd = 0;
  if (screenType !== "fixedPanel" && screenType !== "splay") {
    if (config.isSliding) doorAdd = 150;
    else if (config.doorMM === 762) doorAdd = 100;
  }
  const exGst = base + colourAdd + doorAdd;
  return { base, colourAdd, doorAdd, exGst, incGst: exGst * 1.1 };
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}
