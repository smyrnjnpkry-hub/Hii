import { StallFlow } from "@/components/stall";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Mit } from "@/lib/types";
import { hoursUntil, todayKey } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/start")({ component: StartPage });

function StartPage() {
  const mits = useStore((s) => s.mits);
  const updateMit = useStore((s) => s.updateMit);
  const addLetter = useStore((s) => s.addLetter);
  const letters = useStore((s) => s.agency.letters);
  const today = todayKey();
  const open = mits.filter((m) => m.status === "open");
  const [stall, setStall] = useState<Mit | null>(null);
  const [letter, setLetter] = useState("");
  const [woopId, setWoopId] = useState<string | null>(null);

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Start engine</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        Motivation is a fraction.
      </h1>
      <p className="mt-2 text-sm text-muted">
        (Expectancy × Value) / (Impulsiveness × Delay). Raise the top. Cut the bottom. A start
        counts, not hours.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {open.length === 0 ? (
          <p className="text-sm text-muted">Nothing open. Place a MIT in Week first.</p>
        ) : (
          open.map((m) => (
            <Card key={m.id}>
              <p className="text-xs text-muted">
                {hoursUntil(m.due)} hours · {m.startCue}
                {m.due !== today ? " · later" : ""}
              </p>
              <p className="font-medium">{m.title}</p>
              <p className="mt-2 text-xs text-muted">
                Expectancy {m.expectancy}/10 · Value {m.value}/10 · starts {m.starts.length}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Lever
                  label="Expectancy"
                  value={m.expectancy}
                  onChange={(n) => updateMit(m.id, { expectancy: n })}
                />
                <Lever
                  label="Value"
                  value={m.value}
                  onChange={(n) => updateMit(m.id, { value: n })}
                />
              </div>
              <label className="mt-3 block text-xs text-muted">Temptation bundle (want only during should)</label>
              <Input
                className="mt-1"
                value={m.bundleWant}
                onChange={(e) => updateMit(m.id, { bundleWant: e.target.value })}
                placeholder="Audiobook only while walking"
              />
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => setStall(m)}>
                  I’m stalling
                </Button>
                <Button size="sm" variant="outline" onClick={() => setWoopId(m.id)}>
                  WOOP
                </Button>
              </div>
              {woopId === m.id ? <Woop mit={m} /> : null}
            </Card>
          ))
        )}
      </div>

      <Card className="mt-5">
        <p className="font-medium">Letter from two-month-out you</p>
        <p className="text-sm text-muted">
          Ten minutes, twice a week. First person or third. Read it when you stall.
        </p>
        {letters[0] ? (
          <p className="mt-2 whitespace-pre-wrap text-sm italic">{letters[0].body}</p>
        ) : null}
        <Textarea
          className="mt-3"
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          placeholder="What does future-you need present-you to start?"
        />
        <Button
          className="mt-3"
          variant="outline"
          disabled={!letter.trim()}
          onClick={() => {
            addLetter(letter.trim());
            setLetter("");
          }}
        >
          Keep letter
        </Button>
      </Card>

      <Card className="mt-3">
        <p className="font-medium">If the day was all delay</p>
        <p className="text-sm text-muted">
          Forgive the delay. Shame increases the next one. Automaticity is not a streak to break.
          Pick one cue tomorrow.
        </p>
      </Card>

      <StallFlow mit={stall} open={!!stall} onClose={() => setStall(null)} />
    </div>
  );
}

function Lever({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="text-xs">
      {label} {value}
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-2 w-full accent-current"
      />
    </label>
  );
}

function Woop({ mit }: { mit: Mit }) {
  const updateMit = useStore((s) => s.updateMit);
  const w = mit.woop ?? { wish: mit.title, outcome: "", obstacle: "", plan: "" };
  function patch(k: keyof typeof w, v: string) {
    updateMit(mit.id, { woop: { ...w, [k]: v } });
  }
  return (
    <div className="mt-3 flex flex-col gap-2">
      <Input value={w.wish} onChange={(e) => patch("wish", e.target.value)} placeholder="Wish" />
      <Input value={w.outcome} onChange={(e) => patch("outcome", e.target.value)} placeholder="Best outcome" />
      <Input value={w.obstacle} onChange={(e) => patch("obstacle", e.target.value)} placeholder="Inner obstacle" />
      <Input
        value={w.plan}
        onChange={(e) => patch("plan", e.target.value)}
        placeholder="If obstacle, then I…"
      />
    </div>
  );
}
