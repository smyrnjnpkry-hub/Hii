import { Card } from "@/components/ui";
import { LESSONS, PILLAR_META } from "@/lib/pillars";
import { PILLARS, type Pillar } from "@/lib/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/learn")({ component: LearnPage });

const KEYS = ["spire", ...PILLARS] as const;

function LearnPage() {
  const [open, setOpen] = useState<(typeof KEYS)[number]>("spire");
  const lesson = LESSONS[open === "spire" ? "spire" : open];

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Learn</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">The prism.</h1>
      <p className="mt-2 text-sm text-muted">
        Two to four minutes each. A teaching framework, not a patented protocol.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setOpen("spire")}
          className={
            "h-9 rounded-full px-3 text-xs font-medium " +
            (open === "spire" ? "bg-fg text-bg" : "bg-sunken text-muted")
          }
        >
          Diagram
        </button>
        {PILLARS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setOpen(p)}
            className={
              "h-9 rounded-full px-3 text-xs font-medium " +
              (open === p ? "text-bg" : "bg-sunken text-muted")
            }
            style={open === p ? { background: PILLAR_META[p].color } : undefined}
          >
            {PILLAR_META[p].letter}
          </button>
        ))}
      </div>

      {open === "spire" ? <Diagram /> : null}

      <Card className="mt-4">
        <p className="text-xs text-muted">{lesson.minutes}</p>
        <h2 className="font-display text-2xl">{lesson.title}</h2>
        <div className="mt-3 flex flex-col gap-3 text-sm">
          {lesson.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-sunken p-3 text-sm">
          <span className="font-medium">Pitfall. </span>
          {lesson.pitfall}
        </p>
      </Card>
    </div>
  );
}

function Diagram() {
  return (
    <Card className="mt-4">
      <p className="text-center text-sm text-muted">Sixty seconds</p>
      <div className="mx-auto mt-3 flex h-4 max-w-xs overflow-hidden rounded-full">
        {PILLARS.map((p) => (
          <div key={p} className="flex-1" style={{ background: PILLAR_META[p].color }} />
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {PILLARS.map((p: Pillar) => (
          <li key={p} className="flex gap-3 text-sm">
            <span className="w-4 font-semibold" style={{ color: PILLAR_META[p].color }}>
              {PILLAR_META[p].letter}
            </span>
            <span>
              <span className="font-medium">{PILLAR_META[p].label}. </span>
              {PILLAR_META[p].short}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">
        Look at the colors. Do not stare at the sun. Money is not a sixth spoke — security
        matters, then it is a derivative of these five.
      </p>
    </Card>
  );
}
