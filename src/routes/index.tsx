import { Radar } from "@/components/radar";
import { StallFlow } from "@/components/stall";
import { Button, Card } from "@/components/ui";
import { HARD_STAIRS, PILLAR_META, mviFor } from "@/lib/pillars";
import { isScheduledToday, totalSec } from "@/lib/routines";
import { lastNightSleep, lowestFrom, useStore } from "@/lib/store";
import { isInTodayView } from "@/lib/tasks";
import type { Mit } from "@/lib/types";
import { cn, formatDuration, formatLongDate, formatTime, hoursUntil, todayKey, weekday } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Play } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({ component: Today });

function Today() {
  const settings = useStore((s) => s.settings);
  const checkIns = useStore((s) => s.checkIns);
  const habits = useStore((s) => s.habits);
  const mits = useStore((s) => s.mits);
  const sleepLog = useStore((s) => s.sleepLog);
  const completeHabit = useStore((s) => s.completeHabit);
  const missHabit = useStore((s) => s.missHabit);
  const shrinkHabit = useStore((s) => s.shrinkHabit);
  const setSeason = useStore((s) => s.setSeason);
  const completeMit = useStore((s) => s.completeMit);
  const hardStairs = useStore((s) => s.hardStairs);
  const setHardStair = useStore((s) => s.setHardStair);
  const routines = useStore((s) => s.routines);
  const completions = useStore((s) => s.completions);
  const startRun = useStore((s) => s.startRun);
  const tasks = useStore((s) => s.tasks);
  const toggleTask = useStore((s) => s.toggleTask);
  const navigate = useNavigate();
  const today = todayKey();
  const last = checkIns[0] ?? null;
  const lowest = lowestFrom({ checkIns });
  const mvi = mviFor(lowest, settings.season === "hard");
  const dow = weekday(today);
  const due = habits.filter((h) => h.daysOfWeek.includes(dow));
  const todayMits = mits.filter((m) => m.due === today);
  const todayRoutines = routines.filter((r) => isScheduledToday(r));
  const doneRoutineIds = new Set(
    completions.filter((c) => c.date === today && c.completedSteps > 0).map((c) => c.routineId),
  );
  const todayTasks = tasks.filter((t) => isInTodayView(t, today));
  const sleep = lastNightSleep({ sleepLog });
  const loadCut = (sleep?.hours ?? 8) < 6.5;
  const [stall, setStall] = useState<Mit | null>(null);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    const n = settings.name || "friend";
    if (h < 12) return `Morning, ${n}.`;
    if (h < 17) return `Afternoon, ${n}.`;
    return `Evening, ${n}.`;
  }, [settings.name]);

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        {formatLongDate(today)}
      </p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{greeting}</h1>
        <button
          type="button"
          onClick={() => setSeason(settings.season === "hard" ? "ordinary" : "hard")}
          className={cn(
            "h-9 shrink-0 rounded-full px-3 text-xs font-medium",
            settings.season === "hard" ? "bg-fg text-bg" : "bg-sunken text-muted",
          )}
        >
          {settings.season === "hard" ? "Hard season" : "Ordinary"}
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">
        Do not chase a feeling. Look at the five colors.
      </p>

      <Card className="mt-5">
        <Radar scores={last?.scores ?? null} />
        <p className="mt-1 text-center text-xs text-muted">
          {last ? `Last check-in · ${last.date}` : "No check-in yet"}
        </p>
      </Card>

      {loadCut ? (
        <Card className="mt-4 bg-sunken">
          <p className="font-medium">Load cut.</p>
          <p className="text-sm text-muted">
            Sleep was under 6.5 hours. Keep one MIT. Protect a 20-minute walk and earlier
            lights-out. Recovery is not earned.
          </p>
        </Card>
      ) : null}

      <section className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Smallest next act
        </p>
        <Card>
          <p className="text-xs font-medium" style={{ color: PILLAR_META[lowest].color }}>
            {PILLAR_META[lowest].label} · {mvi.minutes} min
          </p>
          <p className="mt-1 font-display text-xl">{mvi.title}</p>
          <p className="mt-1 text-sm text-muted">{mvi.detail}</p>
          <Link to="/habits" className="mt-3 inline-flex h-11 items-center text-sm font-medium">
            Open in Habits →
          </Link>
        </Card>
      </section>

      <section className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
          After the cue
        </p>
        <div className="flex flex-col gap-2">
          {due.length === 0 ? (
            <p className="text-sm text-muted">No habits pinned to this weekday.</p>
          ) : (
            due.slice(0, 3).map((h) => {
              const done = h.completions.some((c) => c.date === today);
              const missed = h.misses.some((m) => m.date === today);
              return (
                <Card key={h.id} className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => (done ? missHabit(h.id) : completeHabit(h.id))}
                    className={cn(
                      "mt-0.5 grid size-11 shrink-0 place-items-center rounded-full",
                      done ? "bg-primary text-primary-fg" : "bg-sunken text-muted",
                    )}
                    aria-label="Fired after the cue"
                  >
                    <Check className="size-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted">
                      After {h.cueRoutine}, in {h.cuePlace}
                    </p>
                    <p className="font-medium">{h.tinyAct}</p>
                    {done ? (
                      <p className="text-xs text-primary">Vote cast for {h.identity}</p>
                    ) : missed ? (
                      <button
                        type="button"
                        className="text-xs text-muted underline"
                        onClick={() => shrinkHabit(h.id)}
                      >
                        Automaticity is not reset. Shrink the act.
                      </button>
                    ) : null}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Routines
          </p>
          <Link to="/routines" className="text-xs text-muted">
            All
          </Link>
        </div>
        {todayRoutines.length === 0 ? (
          <p className="text-sm text-muted">None scheduled today. Open Routines to add Morning or Night.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todayRoutines.slice(0, 3).map((r) => {
              const done = doneRoutineIds.has(r.id);
              return (
                <Card key={r.id} className={cn("flex items-center gap-3", done && "opacity-70")}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {r.emoji} {r.name}
                    </p>
                    <p className="text-xs text-muted">
                      {r.steps.length} steps · {formatDuration(totalSec(r))}
                      {r.anytime ? "" : ` · ${formatTime(r.startTime)}`}
                      {done ? " · finished" : ""}
                    </p>
                  </div>
                  {!done ? (
                    <Button
                      size="icon"
                      aria-label={`Start ${r.name}`}
                      onClick={() => {
                        startRun(r.id);
                        void navigate({ to: "/run/$id", params: { id: r.id } });
                      }}
                    >
                      <Play className="size-4 fill-current" />
                    </Button>
                  ) : (
                    <span className="grid size-11 place-items-center text-primary">
                      <Check className="size-5" />
                    </span>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Tasks
          </p>
          <Link to="/tasks" className="text-xs text-muted">
            Open
          </Link>
        </div>
        {todayTasks.length === 0 ? (
          <p className="text-sm text-muted">Nothing due. Open Tasks to capture or assign a date.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todayTasks.slice(0, 4).map((t) => (
              <Card key={t.id} className="flex items-start gap-3">
                <button
                  type="button"
                  aria-label="Complete task"
                  onClick={() => toggleTask(t.id)}
                  className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-full bg-sunken text-muted"
                >
                  <Check className="size-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted">
                    {t.carriedFrom ? "Carried forward · " : ""}
                    {hoursUntil(t.dueDate || today)}h left
                    {t.reminder ? ` · ${t.reminder}` : ""}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Three MITs
          </p>
          <Link to="/week" className="text-xs text-muted">
            Week OS
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {todayMits.length === 0 ? (
            <p className="text-sm text-muted">Nothing assigned. Open Week to place three starts.</p>
          ) : (
            todayMits.slice(0, loadCut ? 1 : 3).map((m) => (
              <Card key={m.id}>
                <p className="text-xs text-muted">
                  {m.startCue} · {hoursUntil(m.due)} hours left
                  {m.carriedFrom ? " · carried forward" : ""}
                </p>
                <p className={cn("font-medium", m.status === "done" && "line-through text-muted")}>
                  {m.title}
                </p>
                {m.status === "open" ? (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => setStall(m)}>
                      I’m stalling
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => completeMit(m.id)}>
                      Done
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted">{m.status}</p>
                )}
              </Card>
            ))
          )}
        </div>
      </section>

      {settings.season === "hard" ? (
        <section className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Climb the five stairs
          </p>
          <div className="flex flex-col gap-2">
            {HARD_STAIRS.map((st, i) => (
              <Card key={st.id}>
                <p className="text-xs" style={{ color: PILLAR_META[st.pillar].color }}>
                  {i + 1}. {st.title}
                </p>
                <p className="text-sm text-muted">{st.ask}</p>
                <input
                  className="mt-2 h-11 w-full rounded-xl bg-sunken px-3 text-sm"
                  value={hardStairs[st.id] ?? ""}
                  onChange={(e) => setHardStair(st.id, e.target.value)}
                  placeholder="One sentence"
                />
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Link
          to="/check-in"
          className="flex h-14 items-center justify-center rounded-2xl bg-surface text-sm font-medium shadow-card"
        >
          Check-in
        </Link>
        <Link
          to="/start"
          className="flex h-14 items-center justify-center rounded-2xl bg-surface text-sm font-medium shadow-card"
        >
          Start engine
        </Link>
      </div>

      <StallFlow mit={stall} open={!!stall} onClose={() => setStall(null)} />
    </div>
  );
}
