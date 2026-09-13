import { Card } from "@/components/ui";
import { PILLAR_META } from "@/lib/pillars";
import { useStore } from "@/lib/store";
import { PILLARS } from "@/lib/types";
import { mean, todayKey, weekStart } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/progress")({ component: ProgressPage });

function ProgressPage() {
  const checkIns = useStore((s) => s.checkIns);
  const habits = useStore((s) => s.habits);
  const mits = useStore((s) => s.mits);
  const journal = useStore((s) => s.journal);
  const start = weekStart();
  const weekChecks = checkIns.filter((c) => c.date >= start);
  const weekHabits = habits.reduce((a, h) => {
    return a + h.completions.filter((c) => c.date >= start).length;
  }, 0);
  const starts = mits.reduce((a, m) => a + m.starts.filter((s) => s.at.slice(0, 10) >= start).length, 0);
  const avgs = PILLARS.map((p) => ({
    p,
    v: mean(weekChecks.map((c) => c.scores[p])),
  }));

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Progress</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">A recap, not a grade.</h1>
      <p className="mt-2 text-sm text-muted">
        Happiness lives on a continuum. There is no arrived. These numbers describe practice,
        not worth.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat n={weekChecks.length} label="Check-ins" />
        <Stat n={weekHabits} label="Cued votes" />
        <Stat n={starts} label="Starts" />
      </div>

      <Card className="mt-4">
        <p className="font-medium">Pillar averages this week</p>
        {avgs.map(({ p, v }) => (
          <div key={p} className="mt-3">
            <div className="flex justify-between text-sm">
              <span style={{ color: PILLAR_META[p].color }}>{PILLAR_META[p].label}</span>
              <span className="tabular-nums text-muted">{v ? v.toFixed(1) : "—"}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full"
                style={{ width: `${(v || 0) * 10}%`, background: PILLAR_META[p].color }}
              />
            </div>
          </div>
        ))}
      </Card>

      <Card className="mt-3">
        <p className="font-medium">Humble insights</p>
        <ul className="mt-2 list-disc pl-4 text-sm text-muted">
          <li>Lowest color is a place to offer an MVI, not a verdict.</li>
          <li>
            Journal pages this week: {journal.filter((j) => j.date >= start).length}. One true
            sentence counts.
          </li>
          <li>Today is {todayKey()}. The continuum continues.</li>
        </ul>
      </Card>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <Card className="text-center">
      <p className="font-display text-2xl tabular-nums">{n}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}
