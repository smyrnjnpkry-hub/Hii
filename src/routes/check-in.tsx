import { Radar } from "@/components/radar";
import { Button, Card, Range, Textarea } from "@/components/ui";
import { MICRO_LIBRARY, MVI_LIBRARY, PILLAR_META, lowestPillar } from "@/lib/pillars";
import { useStore } from "@/lib/store";
import { EMPTY_SCORES, PILLARS, type Scores } from "@/lib/types";
import { cn, todayKey } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/check-in")({ component: CheckInPage });

function CheckInPage() {
  const checkIns = useStore((s) => s.checkIns);
  const save = useStore((s) => s.saveCheckIn);
  const today = todayKey();
  const existing = checkIns.find((c) => c.date === today);
  const [scores, setScores] = useState<Scores>(existing?.scores ?? { ...EMPTY_SCORES });
  const [note, setNote] = useState(existing?.note ?? "");
  const [picked, setPicked] = useState<string[]>(existing?.actions ?? []);
  const [saved, setSaved] = useState(false);
  const low = lowestPillar(scores);
  const suggestions = useMemo(
    () =>
      [...MVI_LIBRARY, ...MICRO_LIBRARY.filter((m) => m.minutes <= 10)].filter(
        (a) => a.pillar === low,
      ),
    [low],
  );

  function toggle(id: string) {
    setPicked((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 2) return [cur[1], id];
      return [...cur, id];
    });
  }

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">SPIRE check-in</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Five colors.</h1>
      <p className="mt-2 text-sm text-muted">
        Daily is welcome. Weekly is enough. Missed days are not a failure.
      </p>

      <div className="mt-5 flex flex-col gap-5">
        {PILLARS.map((p) => (
          <div key={p}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="font-medium" style={{ color: PILLAR_META[p].color }}>
                {PILLAR_META[p].label}
              </span>
              <span className="text-xs text-muted">{PILLAR_META[p].short}</span>
            </div>
            <p className="mb-2 text-xs text-muted">{PILLAR_META[p].definition}</p>
            <Range
              value={scores[p]}
              color={PILLAR_META[p].color}
              onChange={(n) => setScores({ ...scores, [p]: n })}
            />
          </div>
        ))}
      </div>

      <label className="mt-6 block text-sm font-medium">A note, if you want</label>
      <Textarea
        className="mt-2"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What is true, not what should be true."
      />

      <p className="mt-6 text-sm font-medium">Pick 1–2 actions for the lowest color</p>
      <p className="text-xs text-muted">
        Right now that is {PILLAR_META[low].label}. Small is enough.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {suggestions.slice(0, 5).map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => toggle(a.id)}
            className={cn(
              "rounded-2xl px-4 py-3 text-left shadow-card",
              picked.includes(a.id) ? "bg-fg text-bg" : "bg-surface",
            )}
          >
            <span className="block text-sm font-medium">{a.title}</span>
            <span className={cn("text-xs", picked.includes(a.id) ? "opacity-80" : "text-muted")}>
              {a.minutes} min · {a.detail}
            </span>
          </button>
        ))}
      </div>

      <Button
        className="mt-6 w-full"
        onClick={() => {
          save(scores, note, picked);
          setSaved(true);
        }}
      >
        Save snapshot
      </Button>
      {saved ? (
        <Card className="mt-4">
          <p className="text-center text-sm text-muted">A snapshot, not a grade.</p>
          <Radar scores={scores} />
        </Card>
      ) : null}
    </div>
  );
}
