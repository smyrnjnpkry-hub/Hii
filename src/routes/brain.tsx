import { Button, Card, Input, Switch } from "@/components/ui";
import { useStore } from "@/lib/store";
import { todayKey, weekStart } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/brain")({ component: BrainPage });

function BrainPage() {
  const brain = useStore((s) => s.brain);
  const upsert = useStore((s) => s.upsertBrain);
  const checkups = useStore((s) => s.checkups);
  const setCheckups = useStore((s) => s.setCheckups);
  const drillBest = useStore((s) => s.drillBest);
  const today = todayKey();
  const day =
    brain.find((b) => b.date === today) ?? {
      date: today,
      sleepHours: 7,
      wakeTime: "07:00",
      aerobicMin: 0,
      strength: false,
      mindMeal: false,
      social: "",
      learnMin: 0,
      downshift: false,
      drinks: 0,
      smoked: false,
    };
  const start = weekStart();
  const week = brain.filter((b) => b.date >= start);
  const floors = useMemo(() => {
    const hits = week.filter((b) => {
      let n = 0;
      if (b.sleepHours >= 7) n++;
      if (b.aerobicMin >= 20) n++;
      if (b.mindMeal) n++;
      if (b.social) n++;
      if (b.learnMin >= 15) n++;
      return n;
    });
    const possible = Math.max(1, week.length) * 5;
    const got = week.reduce((a, b) => {
      let n = 0;
      if (b.sleepHours >= 7) n++;
      if (b.aerobicMin >= 20) n++;
      if (b.mindMeal) n++;
      if (b.social) n++;
      if (b.learnMin >= 15) n++;
      return a + n;
    }, 0);
    void hits;
    return Math.round((got / possible) * 100);
  }, [week]);

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Cognitive health</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">A stack, not a score.</h1>
      <p className="mt-2 text-sm text-muted">
        Educational, not medical advice. Talk to a clinician for blood pressure, cholesterol,
        hearing, vision, mood. About 45% of dementia cases are linked to 14 modifiable factors
        (Lancet 2024) — this screen tracks behaviors, never a disease risk percent.
      </p>

      <Card className="mt-4">
        <p className="text-xs text-muted">This week’s stack consistency</p>
        <p className="font-display text-4xl tabular-nums">{week.length ? floors : 0}</p>
        <p className="text-xs text-muted">Share of daily floors hit. Not brain age.</p>
      </Card>

      <div className="mt-4 flex flex-col gap-3">
        <Card>
          <p className="font-medium">Sleep window</p>
          <div className="mt-2 flex gap-2">
            <Input
              type="number"
              min={0}
              max={14}
              step={0.5}
              value={day.sleepHours}
              onChange={(e) => upsert({ sleepHours: Number(e.target.value) })}
            />
            <Input
              type="time"
              value={day.wakeTime}
              onChange={(e) => upsert({ wakeTime: e.target.value })}
            />
          </div>
          <p className="mt-1 text-xs text-muted">Floor: 7 hours. Fixed wake time matters.</p>
        </Card>
        <Card>
          <p className="font-medium">Aerobic minutes</p>
          <Input
            className="mt-2"
            type="number"
            min={0}
            value={day.aerobicMin}
            onChange={(e) => upsert({ aerobicMin: Number(e.target.value) })}
          />
          <p className="mt-1 text-xs text-muted">
            Get slightly out of breath. That session feeds the brain. Floor 20–30 today; 150 a
            week.
          </p>
        </Card>
        <Row
          label="Strength today"
          checked={day.strength}
          onChange={(v) => upsert({ strength: v })}
        />
        <Row
          label="MIND-style meal (greens, berries, nuts, fish)"
          checked={day.mindMeal}
          onChange={(v) => upsert({ mindMeal: v })}
        />
        <Card>
          <p className="font-medium">Named human</p>
          <Input
            className="mt-2"
            value={day.social}
            onChange={(e) => upsert({ social: e.target.value })}
            placeholder="Who did you actually speak with?"
          />
        </Card>
        <Card>
          <p className="font-medium">Hard learning (minutes)</p>
          <Input
            className="mt-2"
            type="number"
            min={0}
            value={day.learnMin}
            onChange={(e) => upsert({ learnMin: Number(e.target.value) })}
          />
        </Card>
        <Row
          label="Downshift 5–10 min"
          checked={day.downshift}
          onChange={(v) => upsert({ downshift: v })}
        />
        <Card>
          <p className="font-medium">Drinks today · smoked</p>
          <div className="mt-2 flex items-center gap-3">
            <Input
              type="number"
              min={0}
              value={day.drinks}
              onChange={(e) => upsert({ drinks: Number(e.target.value) })}
            />
            <Switch checked={day.smoked} onCheckedChange={(v) => upsert({ smoked: v })} />
          </div>
          <p className="mt-1 text-xs text-muted">A count, not a lecture.</p>
        </Card>
      </div>

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Micro-drills · ≤ 8 min
      </p>
      <p className="mt-1 text-sm text-muted">
        ACTIVE trial: reasoning and processing speed transfer better than memory-list games. Do
        not replace a walk with a drill.
      </p>
      <SpeedDrill best={drillBest.speed} />
      <ReasonDrill best={drillBest.reason} />

      <Card className="mt-5">
        <p className="font-medium">Check-in with a clinician</p>
        <label className="mt-2 block text-xs text-muted">Hearing</label>
        <Input
          type="date"
          value={checkups.hearing}
          onChange={(e) => setCheckups({ hearing: e.target.value })}
        />
        <label className="mt-2 block text-xs text-muted">Vision</label>
        <Input
          type="date"
          value={checkups.vision}
          onChange={(e) => setCheckups({ vision: e.target.value })}
        />
        <label className="mt-2 block text-xs text-muted">BP / LDL conversation</label>
        <Input
          type="date"
          value={checkups.clinician}
          onChange={(e) => setCheckups({ clinician: e.target.value })}
        />
      </Card>
    </div>
  );
}

function Row({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium">{label}</p>
      <Switch checked={checked} onCheckedChange={onChange} />
    </Card>
  );
}

function SpeedDrill({ best }: { best: number }) {
  const setBest = useStore((s) => s.setDrillBest);
  const [on, setOn] = useState(false);
  const [n, setN] = useState(0);
  const [odd, setOdd] = useState(0);
  const [t0, setT0] = useState(0);
  const colors = ["var(--color-spiritual)", "var(--color-physical)", "var(--color-relational)"];

  function start() {
    setOn(true);
    setN(0);
    setT0(performance.now());
    setOdd(Math.floor(Math.random() * 4));
  }
  function tap(i: number) {
    if (!on) return;
    if (i !== odd) return;
    const next = n + 1;
    if (next >= 12) {
      const sec = (performance.now() - t0) / 1000;
      const score = Math.round((12 / sec) * 10);
      setBest("speed", Math.max(best, score));
      setOn(false);
      return;
    }
    setN(next);
    setOdd(Math.floor(Math.random() * 4));
  }

  return (
    <Card className="mt-3">
      <p className="font-medium">Processing speed</p>
      <p className="text-xs text-muted">Tap the odd square. Best {best || "—"}.</p>
      {on ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => tap(i)}
              className="h-16 rounded-xl"
              style={{ background: colors[i === odd ? 2 : i % 2] }}
            />
          ))}
        </div>
      ) : (
        <Button className="mt-3" variant="outline" onClick={start}>
          12 taps
        </Button>
      )}
    </Card>
  );
}

function ReasonDrill({ best }: { best: number }) {
  const setBest = useStore((s) => s.setDrillBest);
  const items = [
    { q: "2, 4, 8, 16, ?", a: "32", opts: ["24", "32", "18"] },
    { q: "3, 6, 9, 15, ?", a: "24", opts: ["18", "21", "24"] },
    { q: "A, C, F, J, ?", a: "O", opts: ["M", "O", "N"] },
    { q: "1, 1, 2, 3, 5, ?", a: "8", opts: ["7", "8", "9"] },
  ];
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const [done, setDone] = useState(false);
  const cur = items[i];

  function pick(v: string) {
    const nextOk = ok + (v === cur.a ? 1 : 0);
    if (i === items.length - 1) {
      setOk(nextOk);
      setDone(true);
      setBest("reason", Math.max(best, nextOk));
      return;
    }
    setOk(nextOk);
    setI(i + 1);
  }

  return (
    <Card className="mt-3">
      <p className="font-medium">Reasoning</p>
      <p className="text-xs text-muted">What comes next? Best {best || "—"} / {items.length}.</p>
      {done ? (
        <p className="mt-2 text-sm">{ok} correct. Struggle is the point.</p>
      ) : (
        <>
          <p className="mt-3 font-display text-xl">{cur.q}</p>
          <div className="mt-3 flex gap-2">
            {cur.opts.map((o) => (
              <Button key={o} variant="outline" className="flex-1" onClick={() => pick(o)}>
                {o}
              </Button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
