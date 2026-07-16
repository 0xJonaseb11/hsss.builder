"use client";

import type { FixedStyle, HingeSide, Side, SwingDirection } from "@/lib/constants";
import { splayedCutForInternal } from "@/lib/constants";
import type { FrontOnlyStyle, ScreenType } from "@/lib/orders";

const C = {
  wall: "#6B7280",
  glass: "#2563EB",
  door: "#0EA5E9",
  hinge: "#1E3A8A",
  measure: "#EA580C",
  walk: "#C2410C",
  label: "#1E40AF",
  muted: "#64748B",
  bg: "#F8FAFC",
  corner: "#94A3B8",
};

function WallH({ x, y, w }: Readonly<{ x: number; y: number; w: number }>) {
  return <rect x={x} y={y} width={w} height={10} fill={C.wall} rx={1} />;
}

function WallV({ x, y, h }: Readonly<{ x: number; y: number; h: number }>) {
  return <rect x={x} y={y} width={10} height={h} fill={C.wall} rx={1} />;
}

/** Thin glass as a stroked line (true plan view). */
function GlassLine({
  x1,
  y1,
  x2,
  y2,
  door = false,
}: Readonly<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  door?: boolean;
}>) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={door ? C.door : C.glass}
      strokeWidth={door ? 5 : 4}
      strokeLinecap="square"
    />
  );
}

function Hinge({ cx, cy }: Readonly<{ cx: number; cy: number }>) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={C.hinge} />
      <circle cx={cx} cy={cy} r={2.5} fill="white" />
    </g>
  );
}

function Corner90({
  cx,
  cy,
  interior,
  size = 10,
}: Readonly<{
  cx: number;
  cy: number;
  interior: "ne" | "nw" | "se" | "sw";
  size?: number;
}>) {
  const toE = interior === "ne" || interior === "se";
  const toS = interior === "se" || interior === "sw";
  const x = toE ? cx : cx - size;
  const y = toS ? cy : cy - size;
  const labelX = toE ? cx + size + 3 : cx - size - 3;
  const labelY = toS ? cy + size - 1 : cy - size + 8;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="none"
        stroke={C.corner}
        strokeWidth={1.35}
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor={toE ? "start" : "end"}
        fontSize={8}
        fill={C.muted}
        fontWeight={600}
      >
        90°
      </text>
    </g>
  );
}

function Dim({
  x1,
  y1,
  x2,
  y2,
  label,
  vertical = false,
  /** Shift label off the measure line (SVG units). Vertical: +x = right of line. */
  labelNudge = 0,
}: Readonly<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  vertical?: boolean;
  labelNudge?: number;
}>) {
  const mx = (x1 + x2) / 2 + (vertical ? labelNudge : 0);
  const my = (y1 + y2) / 2 + (vertical ? 0 : labelNudge);
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={C.measure}
        strokeWidth={1.25}
        strokeDasharray="4 3"
        markerStart="url(#arrow)"
        markerEnd="url(#arrow)"
      />
      <text
        x={mx}
        y={vertical ? my : my - 6}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill={C.measure}
        transform={vertical ? `rotate(-90 ${mx} ${my})` : undefined}
      >
        {label}
      </text>
    </g>
  );
}

function WalkBox({
  x,
  y,
  w,
  h = 18,
}: Readonly<{ x: number; y: number; w: number; h?: number }>) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke={C.walk}
        strokeWidth={1.5}
        strokeDasharray="5 3"
        rx={2}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 3.5}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill={C.walk}
      >
        Walk
      </text>
    </g>
  );
}

function Label({
  x,
  y,
  children,
  rotate,
}: Readonly<{
  x: number;
  y: number;
  children: string;
  rotate?: number;
}>) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={9}
      fontWeight={700}
      fill={C.label}
      transform={rotate != null ? `rotate(${rotate} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

function SwingH({
  hingeX,
  hingeY,
  doorW,
  hingeSide,
  swingDirection,
  maxR = 48,
}: Readonly<{
  hingeX: number;
  hingeY: number;
  doorW: number;
  hingeSide: HingeSide;
  swingDirection: SwingDirection;
  maxR?: number;
}>) {
  const r = Math.min(Math.max(doorW * 0.65, 28), maxR);
  const out = swingDirection === "out";
  const closedX = hingeSide === "left" ? hingeX + r : hingeX - r;
  const openY = out ? hingeY + r : hingeY - r;
  const sweep = hingeSide === "left" ? (out ? 1 : 0) : out ? 0 : 1;
  return (
    <path
      d={`M ${closedX} ${hingeY} A ${r} ${r} 0 0 ${sweep} ${hingeX} ${openY}`}
      fill="none"
      stroke={out ? C.hinge : C.door}
      strokeWidth={1.75}
      strokeDasharray="5 3.5"
      strokeLinecap="round"
    />
  );
}

function Markers() {
  return (
    <defs>
      <marker
        id="arrow"
        markerWidth="6"
        markerHeight="6"
        refX="3"
        refY="3"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <circle cx="3" cy="3" r="1.4" fill={C.measure} />
      </marker>
    </defs>
  );
}

export type ScreenDiagramProps = Readonly<{
  type: ScreenType;
  frontOnlyStyle?: FrontOnlyStyle;
  fixedStyle?: FixedStyle;
  returnSide?: Side;
  panelSide?: Side;
  isSliding?: boolean;
  hingeSide: HingeSide;
  swingDirection: SwingDirection;
  angleHeight?: string;
  frontMM?: string;
  returnMM?: string;
  w2wMM?: string;
  leftPanelMM?: string;
  rightPanelMM?: string;
  panelMM?: string;
  doorMM?: string;
  wallA?: string;
  wallB?: string;
  className?: string;
}>;

export function ScreenDiagram(props: ScreenDiagramProps) {
  const {
    type,
    frontOnlyStyle = "panelDoor",
    fixedStyle = "single",
    returnSide = "left",
    panelSide = "left",
    isSliding = false,
    hingeSide,
    swingDirection,
    angleHeight,
    frontMM = "900",
    returnMM = "900",
    w2wMM = "1200",
    leftPanelMM = "350",
    rightPanelMM = "550",
    panelMM = "900",
    doorMM = "662",
    wallA = "900",
    wallB = "900",
    className = "",
  } = props;

  const frontN = Number(frontMM) || 900;
  const returnN = Number(returnMM) || 900;
  const doorN = Number(doorMM) || 662;
  const w2wN = Number(w2wMM) || 1200;
  const panelN = Number(panelMM) || 900;
  const leftN = Number(leftPanelMM) || 350;
  const rightN = Number(rightPanelMM) || 550;

  const title =
    type === "Front & Return"
      ? `Front & Return - ${returnSide === "left" ? "LH" : "RH"}`
      : type === "Front Only"
        ? frontOnlyStyle === "panelDoorPanel"
          ? "Panel + Door + Panel"
          : "Panel + Door"
        : type === "Splayed"
          ? `Splayed ${wallA} x ${wallB}`
          : fixedStyle === "double"
            ? "Two Fixed Panels"
            : fixedStyle === "panelReturn"
              ? "Fixed + Return"
              : "Single Fixed Panel";

  const subtitle =
    type === "Front & Return"
      ? `${frontN}mm front, ${returnN}mm return, ${doorN}mm door`
      : type === "Front Only" && frontOnlyStyle === "panelDoor"
        ? `${w2wN}mm sheet to sheet, ${doorN}mm door, panel ${panelSide === "left" ? "LHS" : "RHS"}`
        : type === "Front Only"
          ? `L ${leftN} + door ${doorN} + R ${rightN} = ${leftN + doorN + rightN}mm`
          : type === "Splayed"
            ? `${wallA} x ${wallB} from internal corner, door 662mm`
            : fixedStyle === "double"
              ? `${panelN}mm each, ${w2wN}mm wall to wall`
              : fixedStyle === "panelReturn"
                ? `${returnN}mm return, ${frontN}mm front`
                : `${panelN}mm panel, ${w2wN}mm wall to wall`;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-3.5 ${className}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Plan view - overhead
          </p>
          <p className="truncate text-sm font-semibold text-navy">{title}</p>
          <p className="mt-0.5 break-words text-[11px] leading-snug text-slate-500">
            {subtitle}
          </p>
        </div>
        {angleHeight && (
          <span className="shrink-0 rounded-full bg-cyan-soft px-2.5 py-1 text-[11px] font-semibold text-navy">
            {angleHeight} mm
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl">
      <svg
        viewBox="0 0 320 248"
        className="mx-auto block h-auto w-full max-w-md"
        role="img"
        aria-label={`${title} overhead plan`}
      >
        <Markers />
        <rect width={320} height={248} fill={C.bg} rx={12} />

        {type === "Front & Return" && returnSide === "left" && (
          <g>
            <WallH x={86} y={32} w={168} />
            <WallV x={244} y={32} h={118} />
            {(() => {
              const retX = 104;
              const frontY = 142;
              const frontLeft = 104;
              const frontRight = 244;
              const frontLen = frontRight - frontLeft;
              const doorLen = Math.min(
                frontLen * 0.72,
                (doorN / Math.max(frontN, 1)) * frontLen
              );
              const doorX1 = frontLeft;
              const doorX2 = frontLeft + doorLen;
              const hx = hingeSide === "left" ? doorX1 : doorX2;
              return (
                <>
                  <GlassLine x1={retX} y1={46} x2={retX} y2={frontY} />
                  <GlassLine
                    x1={doorX1}
                    y1={frontY}
                    x2={doorX2}
                    y2={frontY}
                    door
                  />
                  <GlassLine
                    x1={doorX2}
                    y1={frontY}
                    x2={frontRight}
                    y2={frontY}
                  />
                  <Corner90 cx={retX} cy={frontY} interior="ne" />
                  <Label x={retX + 14} y={94} rotate={90}>
                    Return
                  </Label>
                  <Label x={(doorX1 + doorX2) / 2} y={frontY + 14}>
                    Door
                  </Label>
                  <Label x={(doorX2 + frontRight) / 2} y={frontY + 14}>
                    Fixed
                  </Label>
                  <text
                    x={176}
                    y={92}
                    textAnchor="middle"
                    fontSize={26}
                    fontWeight={800}
                    fill="#CBD5E1"
                    opacity={0.4}
                  >
                    LH
                  </text>
                  {!isSliding && (
                    <>
                      <SwingH
                        hingeX={hx}
                        hingeY={frontY}
                        doorW={doorLen}
                        hingeSide={hingeSide}
                        swingDirection={swingDirection}
                        maxR={44}
                      />
                      <Hinge cx={hx} cy={frontY} />
                    </>
                  )}
                  <Dim
                    x1={frontLeft}
                    y1={208}
                    x2={frontRight}
                    y2={208}
                    label={`${frontN}mm front`}
                    labelNudge={10}
                  />
                  <Dim
                    x1={retX - 22}
                    y1={46}
                    x2={retX - 22}
                    y2={frontY}
                    label={`${returnN}mm`}
                    vertical
                    labelNudge={-10}
                  />
                </>
              );
            })()}
          </g>
        )}

        {type === "Front & Return" && returnSide === "right" && (
          <g>
            <WallH x={72} y={32} w={168} />
            <WallV x={72} y={32} h={118} />
            {(() => {
              const retX = 216;
              const frontY = 142;
              const frontLeft = 82;
              const frontRight = 216;
              const frontLen = frontRight - frontLeft;
              const doorLen = Math.min(
                frontLen * 0.72,
                (doorN / Math.max(frontN, 1)) * frontLen
              );
              const fixedLen = frontLen - doorLen;
              const fixedX2 = frontLeft + fixedLen;
              const hx = hingeSide === "left" ? fixedX2 : frontRight;
              return (
                <>
                  <GlassLine
                    x1={frontLeft}
                    y1={frontY}
                    x2={fixedX2}
                    y2={frontY}
                  />
                  <GlassLine
                    x1={fixedX2}
                    y1={frontY}
                    x2={frontRight}
                    y2={frontY}
                    door
                  />
                  <GlassLine x1={retX} y1={46} x2={retX} y2={frontY} />
                  <Corner90 cx={retX} cy={frontY} interior="nw" />
                  <Label x={(frontLeft + fixedX2) / 2} y={frontY + 14}>
                    Fixed
                  </Label>
                  <Label x={(fixedX2 + frontRight) / 2} y={frontY + 14}>
                    Door
                  </Label>
                  <Label x={retX - 14} y={94} rotate={-90}>
                    Return
                  </Label>
                  <text
                    x={148}
                    y={92}
                    textAnchor="middle"
                    fontSize={26}
                    fontWeight={800}
                    fill="#CBD5E1"
                    opacity={0.4}
                  >
                    RH
                  </text>
                  {!isSliding && (
                    <>
                      <SwingH
                        hingeX={hx}
                        hingeY={frontY}
                        doorW={doorLen}
                        hingeSide={hingeSide}
                        swingDirection={swingDirection}
                        maxR={44}
                      />
                      <Hinge cx={hx} cy={frontY} />
                    </>
                  )}
                  <Dim
                    x1={frontLeft}
                    y1={208}
                    x2={frontRight}
                    y2={208}
                    label={`${frontN}mm front`}
                    labelNudge={10}
                  />
                  <Dim
                    x1={retX + 22}
                    y1={46}
                    x2={retX + 22}
                    y2={frontY}
                    label={`${returnN}mm`}
                    vertical
                    labelNudge={10}
                  />
                </>
              );
            })()}
          </g>
        )}

        {type === "Front Only" && frontOnlyStyle === "panelDoor" && (
          <g>
            <WallV x={40} y={50} h={120} />
            <WallV x={270} y={50} h={120} />
            {(() => {
              const y = 130;
              const L = 50;
              const R = 270;
              const run = R - L;
              const doorLen = (doorN / Math.max(w2wN, 1)) * run;
              const panelLen = run - doorLen;
              const panelLeft = panelSide === "left";
              const p1 = L;
              const p2 = panelLeft ? L + panelLen : L + doorLen;
              const d1 = panelLeft ? L + panelLen : L;
              const d2 = panelLeft ? R : L + doorLen;
              const hx = hingeSide === "left" ? d1 : d2;
              return (
                <>
                  <text
                    x={160}
                    y={70}
                    textAnchor="middle"
                    fontSize={16}
                    fontWeight={800}
                    fill="#93C5FD"
                  >
                    PANEL {panelSide === "left" ? "LHS" : "RHS"}
                  </text>
                  {panelLeft ? (
                    <>
                      <GlassLine x1={p1} y1={y} x2={p2} y2={y} />
                      <GlassLine x1={d1} y1={y} x2={d2} y2={y} door />
                      <Label x={(p1 + p2) / 2} y={y - 10}>
                        Fixed Panel
                      </Label>
                      <Label x={(d1 + d2) / 2} y={y - 10}>
                        {`Door ${doorN}mm`}
                      </Label>
                    </>
                  ) : (
                    <>
                      <GlassLine x1={d1} y1={y} x2={d2} y2={y} door />
                      <GlassLine x1={p2} y1={y} x2={R} y2={y} />
                      <Label x={(d1 + d2) / 2} y={y - 10}>
                        {`Door ${doorN}mm`}
                      </Label>
                      <Label x={(p2 + R) / 2} y={y - 10}>
                        Fixed Panel
                      </Label>
                    </>
                  )}
                  {!isSliding && (
                    <>
                      <SwingH
                        hingeX={hx}
                        hingeY={y}
                        doorW={doorLen}
                        hingeSide={hingeSide}
                        swingDirection={swingDirection}
                      />
                      <Hinge cx={hx} cy={y} />
                    </>
                  )}
                  <Dim
                    x1={L}
                    y1={175}
                    x2={R}
                    y2={175}
                    label={`${w2wN}mm (sheet to sheet)`}
                  />
                </>
              );
            })()}
          </g>
        )}

        {/* FRONT ONLY - PANEL + DOOR + PANEL */}
        {type === "Front Only" && frontOnlyStyle === "panelDoorPanel" && (
          <g>
            <WallV x={28} y={50} h={120} />
            <WallV x={292} y={50} h={120} />
            {(() => {
              const y = 130;
              const L = 38;
              const R = 282;
              const run = R - L;
              const total = leftN + doorN + rightN;
              const lW = (leftN / total) * run;
              const dW = (doorN / total) * run;
              const rW = (rightN / total) * run;
              const d1 = L + lW;
              const d2 = d1 + dW;
              const hx = hingeSide === "left" ? d1 : d2;
              return (
                <>
                  <GlassLine x1={L} y1={y} x2={d1} y2={y} />
                  <GlassLine x1={d1} y1={y} x2={d2} y2={y} door />
                  <GlassLine x1={d2} y1={y} x2={R} y2={y} />
                  <Label x={L + lW / 2} y={y - 12}>{`L: ${leftN}mm`}</Label>
                  <Label x={L + lW / 2} y={y + 16}>{`${leftN}mm`}</Label>
                  <Label x={(d1 + d2) / 2} y={y - 12}>{`Door ${doorN}mm`}</Label>
                  <Label x={d2 + rW / 2} y={y - 12}>{`R: ${rightN}mm`}</Label>
                  <Label x={d2 + rW / 2} y={y + 16}>{`${rightN}mm`}</Label>
                  {!isSliding && (
                    <>
                      <SwingH
                        hingeX={hx}
                        hingeY={y}
                        doorW={dW}
                        hingeSide={hingeSide}
                        swingDirection={swingDirection}
                        maxR={40}
                      />
                      <Hinge cx={hx} cy={y} />
                    </>
                  )}
                  <Dim
                    x1={L}
                    y1={180}
                    x2={R}
                    y2={180}
                    label={`${total}mm (sheet to sheet)`}
                  />
                </>
              );
            })()}
          </g>
        )}

        {/* SPLAYED */}
        {type === "Splayed" && (
          <g>
            {/* Internal corner walls */}
            <WallH x={60} y={50} w={100} />
            <WallV x={60} y={50} h={100} />
            <text
              x={78}
              y={78}
              fontSize={8}
              fontWeight={600}
              fill={C.muted}
            >
              internal corner
            </text>
            {(() => {
              const a = Number(wallA) || 900;
              const b = Number(wallB) || 900;
              const cutA = splayedCutForInternal(a) ?? 425;
              const cutB = splayedCutForInternal(b) ?? 425;
              // Panel ends along walls from corner
              const p1 = { x: 70, y: 150 }; // end of wall-A panel
              const p2 = { x: 200, y: 60 }; // end of wall-B panel
              const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
              const hx = hingeSide === "left" ? p1.x : p2.x;
              const hy = hingeSide === "left" ? p1.y : p2.y;
              return (
                <>
                  <GlassLine x1={70} y1={60} x2={p1.x} y2={p1.y} />
                  <GlassLine x1={70} y1={60} x2={p2.x} y2={p2.y} />
                  <GlassLine x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} door />
                  <Label x={95} y={115} rotate={-55}>{`Cut @ ${cutA}mm`}</Label>
                  <Label x={145} y={70} rotate={-20}>{`Cut @ ${cutB}mm`}</Label>
                  <Label x={mid.x} y={mid.y + 18}>Door 662mm</Label>
                  <Dim
                    x1={70}
                    y1={170}
                    x2={p1.x}
                    y2={170}
                    label={`${a}mm from corner`}
                  />
                  <Dim
                    x1={210}
                    y1={60}
                    x2={210}
                    y2={150}
                    label={`${b}mm from corner`}
                    vertical
                  />
                  {!isSliding && (
                    <>
                      {/* Simplified arc for diagonal door */}
                      <path
                        d={`M ${p1.x} ${p1.y} Q ${mid.x + 30} ${mid.y + 40} ${p2.x} ${p2.y}`}
                        fill="none"
                        stroke={C.hinge}
                        strokeWidth={1.5}
                        strokeDasharray="5 3"
                        opacity={0.7}
                      />
                      <Hinge cx={hx} cy={hy} />
                    </>
                  )}
                </>
              );
            })()}
          </g>
        )}

        {/* FIXED - SINGLE */}
        {type === "Fixed Panel" && fixedStyle === "single" && (
          <g>
            <WallV x={40} y={50} h={120} />
            <WallV x={270} y={50} h={120} />
            {(() => {
              const y = 130;
              const L = 50;
              const R = 270;
              const run = R - L;
              const pLen = Math.min((panelN / Math.max(w2wN, 1)) * run, run * 0.7);
              const walk = run - pLen;
              if (panelSide === "left") {
                return (
                  <>
                    <text x={160} y={70} textAnchor="middle" fontSize={16} fontWeight={800} fill="#93C5FD">
                      PANEL LHS
                    </text>
                    <GlassLine x1={L} y1={y} x2={L + pLen} y2={y} />
                    <Label x={L + pLen / 2} y={y - 10}>Fixed</Label>
                    <Dim x1={L} y1={y - 22} x2={L + pLen} y2={y - 22} label={`${panelN}mm`} />
                    <WalkBox x={L + pLen + 4} y={y - 9} w={walk - 8} />
                  </>
                );
              }
              return (
                <>
                  <text x={160} y={70} textAnchor="middle" fontSize={16} fontWeight={800} fill="#93C5FD">
                    PANEL RHS
                  </text>
                  <WalkBox x={L} y={y - 9} w={walk - 8} />
                  <GlassLine x1={R - pLen} y1={y} x2={R} y2={y} />
                  <Label x={R - pLen / 2} y={y - 10}>Fixed</Label>
                  <Dim x1={R - pLen} y1={y - 22} x2={R} y2={y - 22} label={`${panelN}mm`} />
                </>
              );
            })()}
            <Dim x1={50} y1={175} x2={270} y2={175} label={`${w2wN}mm (wall to wall)`} />
          </g>
        )}

        {/* FIXED - DOUBLE */}
        {type === "Fixed Panel" && fixedStyle === "double" && (
          <g>
            <WallV x={28} y={50} h={120} />
            <WallV x={292} y={50} h={120} />
            {(() => {
              const y = 130;
              const L = 38;
              const R = 282;
              const run = R - L;
              const pLen = Math.min((panelN / Math.max(w2wN, 1)) * run, run * 0.35);
              const walk = run - pLen * 2;
              return (
                <>
                  <GlassLine x1={L} y1={y} x2={L + pLen} y2={y} />
                  <GlassLine x1={R - pLen} y1={y} x2={R} y2={y} />
                  <Label x={L + pLen / 2} y={y - 10}>Fixed</Label>
                  <Label x={R - pLen / 2} y={y - 10}>Fixed</Label>
                  <Dim x1={L} y1={y - 22} x2={L + pLen} y2={y - 22} label={`${panelN}mm`} />
                  <Dim x1={R - pLen} y1={y - 22} x2={R} y2={y - 22} label={`${panelN}mm`} />
                  <WalkBox x={L + pLen + 4} y={y - 9} w={walk - 8} />
                  <Dim x1={L} y1={175} x2={R} y2={175} label={`${w2wN}mm (wall to wall)`} />
                </>
              );
            })()}
          </g>
        )}

        {/* FIXED - PANEL + RETURN */}
        {type === "Fixed Panel" && fixedStyle === "panelReturn" && (
          <g>
            {returnSide === "left" ? (
              <>
                <WallV x={50} y={40} h={140} />
                <WallH x={50} y={40} w={180} />
                {(() => {
                  const retX = 70;
                  const frontY = 160;
                  const frontL = 70;
                  const frontR = 240;
                  const frontLen = frontR - frontL;
                  const fixedLen = Math.min(
                    (panelN / Math.max(frontN, 1)) * frontLen,
                    frontLen * 0.55
                  );
                  const walk = frontLen - fixedLen;
                  return (
                    <>
                      <GlassLine x1={retX} y1={55} x2={retX} y2={frontY} />
                      <Label x={retX - 14} y={105} rotate={-90}>
                        Return + Infill
                      </Label>
                      <Dim
                        x1={retX - 26}
                        y1={55}
                        x2={retX - 26}
                        y2={frontY}
                        label={`${returnN}mm`}
                        vertical
                      />
                      <Corner90 cx={retX} cy={frontY} interior="ne" />
                      <WalkBox x={frontL + 4} y={frontY - 9} w={walk - 8} />
                      <GlassLine
                        x1={frontL + walk}
                        y1={frontY}
                        x2={frontR}
                        y2={frontY}
                      />
                      <Label x={frontL + walk + fixedLen / 2} y={frontY + 16}>
                        Fixed
                      </Label>
                      <text x={150} y={100} textAnchor="middle" fontSize={28} fontWeight={800} fill="#CBD5E1" opacity={0.4}>
                        LH
                      </text>
                      <Dim
                        x1={frontL}
                        y1={190}
                        x2={frontR}
                        y2={190}
                        label={`${frontN}mm`}
                      />
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                <WallV x={260} y={40} h={140} />
                <WallH x={90} y={40} w={180} />
                {(() => {
                  const retX = 250;
                  const frontY = 160;
                  const frontL = 80;
                  const frontR = 250;
                  const frontLen = frontR - frontL;
                  const fixedLen = Math.min(
                    (panelN / Math.max(frontN, 1)) * frontLen,
                    frontLen * 0.55
                  );
                  const walk = frontLen - fixedLen;
                  return (
                    <>
                      <GlassLine x1={retX} y1={55} x2={retX} y2={frontY} />
                      <Label x={retX + 14} y={105} rotate={90}>
                        Return + Infill
                      </Label>
                      <Dim
                        x1={retX + 26}
                        y1={55}
                        x2={retX + 26}
                        y2={frontY}
                        label={`${returnN}mm`}
                        vertical
                      />
                      <Corner90 cx={retX} cy={frontY} interior="nw" />
                      <GlassLine
                        x1={frontL}
                        y1={frontY}
                        x2={frontL + fixedLen}
                        y2={frontY}
                      />
                      <Label x={frontL + fixedLen / 2} y={frontY + 16}>
                        Fixed
                      </Label>
                      <WalkBox
                        x={frontL + fixedLen + 4}
                        y={frontY - 9}
                        w={walk - 8}
                      />
                      <text x={165} y={100} textAnchor="middle" fontSize={28} fontWeight={800} fill="#CBD5E1" opacity={0.4}>
                        RH
                      </text>
                      <Dim
                        x1={frontL}
                        y1={190}
                        x2={frontR}
                        y2={190}
                        label={`${frontN}mm`}
                      />
                    </>
                  );
                })()}
              </>
            )}
          </g>
        )}
      </svg>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-0.5 w-3 bg-blue-600" /> Fixed
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-0.5 w-3 bg-sky-500" /> Door
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-navy" /> Hinge
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-0 w-3 border-t border-dashed border-orange-500" />{" "}
          Measure
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-3 border border-dashed border-orange-700" />{" "}
          Walk
        </span>
      </div>
    </div>
  );
}
