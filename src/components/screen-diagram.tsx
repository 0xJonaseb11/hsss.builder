"use client";

import type { ReactNode } from "react";
import type { HingeSide, SwingDirection } from "@/lib/constants";
import type { FrontOnlyStyle, ScreenType } from "@/lib/orders";

/** HSSS brand-aligned plan colours */
const C = {
  navy: "#003A70",
  cyan: "#00AEEF",
  fixed: "#003A70",
  doorFill: "#B8E6F8",
  doorStroke: "#0077A8",
  hob: "#001B3D",
  hinge: "#003A70",
  wall: "#94A3B8",
  measure: "#EA580C",
  walk: "#F97316",
  arcOut: "#003A70",
  arcIn: "#7DD3FC",
  ghost: "#94A3B8",
  bg: "#F1F5F9",
  paper: "#FFFFFF",
};

function Wall({
  x,
  y,
  w,
  h,
}: Readonly<{ x: number; y: number; w: number; h: number }>) {
  return <rect x={x} y={y} width={w} height={h} fill={C.wall} rx={1.5} />;
}

function Hob({
  x,
  y,
  w,
  h = 7,
}: Readonly<{ x: number; y: number; w: number; h?: number }>) {
  return <rect x={x} y={y} width={w} height={h} fill={C.hob} rx={1} />;
}

function FixedGlass({
  x,
  y,
  w,
  h,
  dashed = false,
}: Readonly<{
  x: number;
  y: number;
  w: number;
  h: number;
  dashed?: boolean;
}>) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill={C.paper}
      stroke={C.fixed}
      strokeWidth={2.25}
      strokeDasharray={dashed ? "5 3.5" : undefined}
      rx={1.5}
    />
  );
}

function DoorGlass({
  x,
  y,
  w,
  h,
}: Readonly<{ x: number; y: number; w: number; h: number }>) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill={C.doorFill}
      stroke={C.doorStroke}
      strokeWidth={2}
      rx={1.5}
    />
  );
}

function HingeDot({ cx, cy }: Readonly<{ cx: number; cy: number }>) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={6.5} fill={C.hinge} />
      <circle cx={cx} cy={cy} r={2.25} fill="white" />
    </g>
  );
}

function MeasureLine({
  x1,
  y1,
  x2,
  y2,
  label,
  vertical = false,
}: Readonly<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  vertical?: boolean;
}>) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={C.measure}
        strokeWidth={1.4}
        strokeDasharray="3.5 2.5"
      />
      <circle cx={x1} cy={y1} r={1.6} fill={C.measure} />
      <circle cx={x2} cy={y2} r={1.6} fill={C.measure} />
      {label && (
        <text
          x={vertical ? mx - 10 : mx}
          y={vertical ? my : my - 7}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill={C.measure}
          transform={vertical ? `rotate(-90 ${mx - 10} ${my})` : undefined}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * Plan-view door swing: hinge moves to the selected end of the door;
 * sweep flips so the arc always pivots around that hinge.
 * Darker = out (into room), lighter = in (into shower).
 */
function DoorSwing({
  doorX,
  doorY,
  doorW,
  doorH,
  hingeSide,
  swingDirection,
}: Readonly<{
  doorX: number;
  doorY: number;
  doorW: number;
  doorH: number;
  hingeSide: HingeSide;
  swingDirection: SwingDirection;
}>) {
  const hy = doorY + doorH / 2;
  const hx = hingeSide === "left" ? doorX : doorX + doorW;
  const r = Math.max(doorW * 0.92, 36);
  const closedX = hingeSide === "left" ? hx + r : hx - r;
  const closedY = hy;
  const out = swingDirection === "out";
  const openY = out ? hy + r : hy - r;
  const openX = hx;
  const sweep =
    hingeSide === "left" ? (out ? 1 : 0) : out ? 0 : 1;
  const stroke = out ? C.arcOut : C.arcIn;
  const width = out ? 2.25 : 1.75;

  const ghost =
    hingeSide === "left"
      ? { x: hx - doorH / 2, y: out ? hy : hy - r, w: doorH, h: r }
      : { x: hx - doorH / 2, y: out ? hy : hy - r, w: doorH, h: r };

  return (
    <g>
      <rect
        x={ghost.x}
        y={ghost.y}
        width={ghost.w}
        height={ghost.h}
        fill="none"
        stroke={C.ghost}
        strokeWidth={1.25}
        strokeDasharray="4 3"
        opacity={0.55}
        rx={1}
      />
      <path
        d={`M ${closedX} ${closedY} A ${r} ${r} 0 0 ${sweep} ${openX} ${openY}`}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray="5 3.5"
        strokeLinecap="round"
      />
      <path
        d={`M ${closedX} ${closedY} A ${r * 0.55} ${r * 0.55} 0 0 ${sweep} ${hx} ${out ? hy + r * 0.55 : hy - r * 0.55}`}
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        strokeDasharray="3.5 3"
        opacity={0.65}
        strokeLinecap="round"
      />
      <HingeDot cx={hx} cy={hy} />
    </g>
  );
}

function SlideCue({ x, y }: Readonly<{ x: number; y: number }>) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={10}
      fontWeight={700}
      fill={C.navy}
    >
      ← slide →
    </text>
  );
}

function Legend() {
  const items: { key: string; label: string; node: ReactNode }[] = [
    {
      key: "fixed",
      label: "Fixed / return",
      node: (
        <rect
          width={14}
          height={9}
          fill={C.paper}
          stroke={C.fixed}
          strokeWidth={1.75}
        />
      ),
    },
    {
      key: "door",
      label: "Door",
      node: (
        <rect
          width={14}
          height={9}
          fill={C.doorFill}
          stroke={C.doorStroke}
          strokeWidth={1.25}
        />
      ),
    },
    {
      key: "hob",
      label: "Hob channel",
      node: <rect width={14} height={9} fill={C.hob} />,
    },
    {
      key: "hinge",
      label: "Hinge",
      node: <circle cx={7} cy={4.5} r={3.5} fill={C.hinge} />,
    },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
      {items.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-1.5">
          <svg width={14} height={9} viewBox="0 0 14 9" aria-hidden>
            {item.node}
          </svg>
          {item.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-0 w-3.5 border-t border-dashed"
          style={{ borderColor: C.measure }}
        />
        Measure
      </span>
    </div>
  );
}

export type ScreenDiagramProps = Readonly<{
  type: ScreenType;
  frontOnlyStyle?: FrontOnlyStyle;
  isSliding?: boolean;
  hingeSide: HingeSide;
  swingDirection: SwingDirection;
  angleHeight?: string;
  frontMM?: string;
  returnMM?: string;
  w2wMM?: string;
  panelMM?: string;
  wallA?: string;
  wallB?: string;
  className?: string;
}>;

export function ScreenDiagram({
  type,
  frontOnlyStyle = "panelDoor",
  isSliding = false,
  hingeSide,
  swingDirection,
  angleHeight,
  frontMM,
  returnMM,
  w2wMM,
  panelMM,
  wallA,
  wallB,
  className = "",
}: ScreenDiagramProps) {
  const showSwing =
    !isSliding && (type === "Front & Return" || type === "Front Only");

  const title =
    type === "Front Only"
      ? frontOnlyStyle === "panelDoorPanel"
        ? "Front only — panel + door + panel"
        : frontOnlyStyle === "doorCentred"
          ? "Front only — door centred"
          : "Front only — panel + door"
      : type;

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-3.5 ${className}`}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Plan view
          </p>
          <p className="text-sm font-semibold text-navy">{title}</p>
        </div>
        {angleHeight && (
          <span className="shrink-0 rounded-full bg-cyan-soft px-2.5 py-1 text-[11px] font-semibold text-navy">
            {angleHeight} mm angle
          </span>
        )}
      </div>

      <svg
        viewBox="0 0 300 220"
        className="mx-auto h-auto w-full max-w-md"
        role="img"
        aria-label={`${title} shower screen plan diagram`}
      >
        <rect width={300} height={220} fill={C.bg} rx={12} />

        {type === "Fixed Panel" && (
          <g>
            <Wall x={48} y={36} w={14} h={148} />
            <Wall x={48} y={170} w={170} h={14} />
            <Hob x={66} y={162} w={130} />
            <FixedGlass x={86} y={78} w={100} h={84} />
            <MeasureLine
              x1={86}
              y1={192}
              x2={186}
              y2={192}
              label={panelMM ? `${panelMM} mm` : "Panel"}
            />
          </g>
        )}

        {type === "Front Only" && frontOnlyStyle === "panelDoor" && (
          <g>
            <Wall x={28} y={34} w={14} h={136} />
            <Wall x={258} y={34} w={14} h={136} />
            <Wall x={28} y={156} w={244} h={14} />
            <Hob x={46} y={148} w={208} />
            <FixedGlass x={54} y={82} w={78} h={66} />
            <DoorGlass x={136} y={82} w={102} h={66} />
            {showSwing && (
              <DoorSwing
                doorX={136}
                doorY={82}
                doorW={102}
                doorH={66}
                hingeSide={hingeSide}
                swingDirection={swingDirection}
              />
            )}
            {isSliding && <SlideCue x={187} y={74} />}
            <MeasureLine
              x1={54}
              y1={186}
              x2={238}
              y2={186}
              label={w2wMM ? `${w2wMM} mm` : "Wall to wall"}
            />
          </g>
        )}

        {type === "Front Only" && frontOnlyStyle === "panelDoorPanel" && (
          <g>
            <Wall x={22} y={34} w={14} h={136} />
            <Wall x={264} y={34} w={14} h={136} />
            <Wall x={22} y={156} w={256} h={14} />
            <Hob x={40} y={148} w={220} />
            <FixedGlass x={48} y={82} w={52} h={66} />
            <DoorGlass x={104} y={82} w={92} h={66} />
            <FixedGlass x={200} y={82} w={52} h={66} dashed />
            {showSwing && (
              <DoorSwing
                doorX={104}
                doorY={82}
                doorW={92}
                doorH={66}
                hingeSide={hingeSide}
                swingDirection={swingDirection}
              />
            )}
            {isSliding && <SlideCue x={150} y={74} />}
            <MeasureLine
              x1={48}
              y1={186}
              x2={252}
              y2={186}
              label={w2wMM ? `${w2wMM} mm` : "Wall to wall"}
            />
          </g>
        )}

        {type === "Front Only" && frontOnlyStyle === "doorCentred" && (
          <g>
            <Wall x={22} y={34} w={14} h={136} />
            <Wall x={264} y={34} w={14} h={136} />
            <Wall x={22} y={156} w={256} h={14} />
            <Hob x={40} y={148} w={220} />
            <FixedGlass x={48} y={82} w={46} h={66} dashed />
            <DoorGlass x={98} y={82} w={104} h={66} />
            <FixedGlass x={206} y={82} w={46} h={66} dashed />
            {showSwing && (
              <DoorSwing
                doorX={98}
                doorY={82}
                doorW={104}
                doorH={66}
                hingeSide={hingeSide}
                swingDirection={swingDirection}
              />
            )}
            {isSliding && <SlideCue x={150} y={74} />}
            <MeasureLine
              x1={48}
              y1={186}
              x2={252}
              y2={186}
              label={w2wMM ? `${w2wMM} mm` : "Wall to wall"}
            />
          </g>
        )}

        {type === "Front & Return" && (
          <g>
            <Wall x={44} y={28} w={14} h={142} />
            <Wall x={44} y={156} w={196} h={14} />
            <Hob x={62} y={148} w={162} />
            {/* Return along left wall */}
            <FixedGlass x={62} y={46} w={52} h={102} />
            {/* Front run: fixed + door */}
            <FixedGlass x={118} y={96} w={54} h={52} />
            <DoorGlass x={176} y={96} w={78} h={52} />
            {showSwing && (
              <DoorSwing
                doorX={176}
                doorY={96}
                doorW={78}
                doorH={52}
                hingeSide={hingeSide}
                swingDirection={swingDirection}
              />
            )}
            {isSliding && <SlideCue x={215} y={88} />}
            <MeasureLine
              x1={118}
              y1={186}
              x2={254}
              y2={186}
              label={frontMM ? `Front ${frontMM}` : "Front"}
            />
            <MeasureLine
              x1={24}
              y1={46}
              x2={24}
              y2={148}
              label={returnMM ? `Return ${returnMM}` : "Return"}
              vertical
            />
          </g>
        )}

        {type === "Splayed" && (
          <g>
            <Wall x={40} y={36} w={14} h={124} />
            <Wall x={224} y={36} w={14} h={124} />
            <Wall x={40} y={146} w={198} h={14} />
            <Hob x={58} y={138} w={162} />
            <polygon
              points="68,64 122,64 134,130 80,130"
              fill={C.paper}
              stroke={C.fixed}
              strokeWidth={2.25}
            />
            <polygon
              points="146,64 210,64 198,130 158,130"
              fill={C.paper}
              stroke={C.fixed}
              strokeWidth={2.25}
            />
            <line
              x1={122}
              y1={64}
              x2={146}
              y2={64}
              stroke={C.walk}
              strokeWidth={2.5}
              strokeDasharray="5 3"
            />
            <text
              x={134}
              y={56}
              textAnchor="middle"
              fontSize={9}
              fontWeight={700}
              fill={C.walk}
            >
              open
            </text>
            <MeasureLine
              x1={68}
              y1={168}
              x2={134}
              y2={168}
              label={wallA ? `A ${wallA}` : "Wall A"}
            />
            <MeasureLine
              x1={146}
              y1={168}
              x2={210}
              y2={168}
              label={wallB ? `B ${wallB}` : "Wall B"}
            />
          </g>
        )}
      </svg>

      <Legend />

      {showSwing && (
        <p className="mt-2.5 rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] leading-snug text-slate-600">
          <span className="font-semibold text-navy">Door swing:</span> hinge
          flips to the selected side.{" "}
          <span className="font-medium text-navy">Dark arc</span> = swing out ·{" "}
          <span className="font-medium text-sky-500">Light arc</span> = swing in.
        </p>
      )}
      {isSliding && (type === "Front & Return" || type === "Front Only") && (
        <p className="mt-2.5 rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] leading-snug text-slate-600">
          Sliding door — no hinge swing. Opening slides along the fixed panel.
        </p>
      )}
    </div>
  );
}
