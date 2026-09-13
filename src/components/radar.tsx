import { PILLAR_META } from "@/lib/pillars";
import { PILLARS, type Scores } from "@/lib/types";
import { cn } from "@/lib/utils";

const ORDER = PILLARS;
const N = ORDER.length;

function polar(i: number, r: number, cx: number, cy: number) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

export function Radar({
  scores,
  size = 260,
  className,
}: {
  scores: Scores | null;
  size?: number;
  className?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.34;
  const rings = [0.25, 0.5, 0.75, 1];
  const pts = ORDER.map((_, i) => {
    const v = scores ? scores[ORDER[i]] / 10 : 0.35;
    return polar(i, maxR * v, cx, cy).join(",");
  }).join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={cn("mx-auto", className)}
      role="img"
      aria-label="SPIRE snapshot"
    >
      {rings.map((t) => (
        <polygon
          key={t}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          points={ORDER.map((_, i) => polar(i, maxR * t, cx, cy).join(",")).join(" ")}
        />
      ))}
      {ORDER.map((_, i) => {
        const [x, y] = polar(i, maxR, cx, cy);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.12}
          />
        );
      })}
      <polygon
        points={pts}
        fill="color-mix(in oklab, var(--color-primary) 28%, transparent)"
        stroke="var(--color-primary)"
        strokeWidth={2}
      />
      {ORDER.map((p, i) => {
        const [x, y] = polar(i, maxR + 22, cx, cy);
        const meta = PILLAR_META[p];
        return (
          <text
            key={p}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontFamily="var(--font-sans)"
            fill={meta.color}
            fontWeight={600}
          >
            {meta.letter}
          </text>
        );
      })}
    </svg>
  );
}

export function PillarBars({ scores }: { scores: Scores | null }) {
  return (
    <div className="flex gap-1.5">
      {ORDER.map((p) => {
        const v = scores ? scores[p] : 0;
        return (
          <div key={p} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-16 w-full items-end overflow-hidden rounded-lg bg-sunken">
              <div
                className="w-full rounded-lg"
                style={{
                  height: `${Math.max(8, v * 10)}%`,
                  background: PILLAR_META[p].color,
                }}
              />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
              {PILLAR_META[p].letter}
            </span>
          </div>
        );
      })}
    </div>
  );
}
