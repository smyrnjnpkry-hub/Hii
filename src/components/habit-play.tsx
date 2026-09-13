import { Button, Card, Modal } from "@/components/ui";
import { dayChain, marksFor, scheduledStreak, startSeconds } from "@/lib/habit-play";
import { PILLAR_META } from "@/lib/pillars";
import { useStore } from "@/lib/store";
import type { Habit } from "@/lib/types";
import { cn, formatClock, todayKey, weekday } from "@/lib/utils";
import { Check, Flame, Minimize2, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export function VotesRing({
  done,
  due,
  label,
}: {
  done: number;
  due: number;
  label?: string;
}) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const t = due === 0 ? 0 : done / due;
  const dash = `${c * t} ${c}`;
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-[112px] shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-sunken"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-primary transition-[stroke-dasharray] duration-500"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={dash}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <p className="font-display text-2xl font-semibold tabular-nums leading-none">
            {done}
            <span className="text-base text-muted">/{due || 0}</span>
          </p>
        </div>
      </div>
      <div className="min-w-0">
        <p className="font-display text-xl font-semibold tracking-tight">Today’s votes</p>
        <p className="mt-1 text-sm text-muted">
          {label ??
            (due === 0
              ? "Nothing cued today. Rest is allowed."
              : done === due
                ? "Every tiny promise for today is in."
                : `${due - done} still waiting after the cue.`)}
        </p>
      </div>
    </div>
  );
}

export function WeekChain({ habits, today = todayKey() }: { habits: Habit[]; today?: string }) {
  const chain = useMemo(() => dayChain(habits, today, 7), [habits, today]);
  return (
    <ol className="mt-4 grid grid-cols-7 gap-1.5" aria-label="Last seven days">
      {chain.map((d) => (
        <li key={d.date} className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium uppercase text-faint">
            {DOW[weekday(d.date)]}
          </span>
          <span
            className={cn(
              "grid size-8 place-items-center rounded-full text-[10px] font-medium",
              d.status === "full" && "bg-primary text-primary-fg",
              d.status === "partial" && "bg-primary/30 text-fg",
              d.status === "open" && "bg-sunken text-muted ring-2 ring-primary/40",
              d.status === "missed" && "bg-danger/15 text-danger",
              d.status === "empty" && "bg-sunken text-faint",
            )}
            title={`${d.date}: ${d.done}/${d.due}`}
          >
            {d.status === "full" ? <Check className="size-3.5" /> : d.done || ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Heatmap({ habit, today = todayKey() }: { habit: Habit; today?: string }) {
  const marks = useMemo(() => marksFor(habit, today, 28), [habit, today]);
  return (
    <div className="grid grid-cols-7 gap-1" aria-label="Four-week chain">
      {marks.map((m) => (
        <span
          key={m.date}
          className={cn(
            "h-3.5 rounded-sm",
            !m.due && "bg-sunken/50",
            m.due && m.done && "bg-primary",
            m.due && !m.done && m.date === today && "bg-primary/25 ring-1 ring-primary/50",
            m.due && m.missed && m.date !== today && "bg-danger/25",
          )}
          title={m.date}
        />
      ))}
    </div>
  );
}

export function HabitPlayCard({
  habit,
  today = todayKey(),
  onStart,
}: {
  habit: Habit;
  today?: string;
  onStart?: (habit: Habit) => void;
}) {
  const completeHabit = useStore((s) => s.completeHabit);
  const missHabit = useStore((s) => s.missHabit);
  const shrinkHabit = useStore((s) => s.shrinkHabit);
  const done = habit.completions.some((c) => c.date === today);
  const missed = habit.misses.some((m) => m.date === today);
  const due = habit.daysOfWeek.includes(weekday(today));
  const streak = scheduledStreak(habit, today);
  const color = PILLAR_META[habit.pillar].color;

  function vote() {
    if (done) missHabit(habit.id);
    else {
      completeHabit(habit.id);
      try {
        navigator.vibrate?.(12);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <Card className={cn("relative overflow-hidden", done && "habit-voted ring-1 ring-primary/30")}>
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: color }}
        aria-hidden
      />
      <div className="flex items-start gap-3 pl-1">
        <button
          type="button"
          onClick={vote}
          className={cn(
            "mt-0.5 grid size-12 shrink-0 place-items-center rounded-full transition-transform active:scale-95",
            done ? "bg-primary text-primary-fg" : "bg-sunken text-muted",
          )}
          aria-label={done ? "Undo today’s vote" : "Cast today’s vote"}
        >
          <Check className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{habit.identity}</p>
          <p className="font-medium">{habit.tinyAct}</p>
          <p className="mt-0.5 text-sm text-muted">
            After {habit.cueRoutine}, in {habit.cuePlace}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            {streak > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-fg">
                <Flame className="size-3 text-primary" />
                {streak} scheduled {streak === 1 ? "day" : "days"}
              </span>
            ) : (
              <span>New chain</span>
            )}
            {habit.keystone ? <span className="uppercase tracking-wide">Keystone</span> : null}
            {missed && !done ? <span className="text-danger">Open recovery</span> : null}
          </div>
          {due && !done ? (
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => (onStart ? onStart(habit) : vote())}>
                <Play className="size-4 fill-current" />
                Two-minute start
              </Button>
              <Button size="sm" variant="ghost" onClick={() => shrinkHabit(habit.id)}>
                <Minimize2 className="size-4" />
                Shrink
              </Button>
            </div>
          ) : done ? (
            <p className="mt-2 text-xs text-primary">Vote cast · identity kept</p>
          ) : (
            <p className="mt-2 text-xs text-muted">Not cued today · {habit.daysOfWeek.map((d) => DOW[d]).join(" · ")}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function TwoMinuteStart({
  habit,
  open,
  onClose,
}: {
  habit: Habit | null;
  open: boolean;
  onClose: () => void;
}) {
  const completeHabit = useStore((s) => s.completeHabit);
  const total = habit ? startSeconds(habit) : 120;
  const [left, setLeft] = useState(total);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!open || !habit) return;
    setLeft(startSeconds(habit));
    setPaused(false);
  }, [open, habit]);

  useEffect(() => {
    if (!open || paused || !habit) return;
    const id = window.setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          completeHabit(habit.id);
          onClose();
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, paused, habit, completeHabit, onClose]);

  if (!habit) return null;
  const t = 1 - left / Math.max(1, total);

  return (
    <Modal open={open} onClose={onClose} title="After the cue">
      <p className="text-sm text-muted">{habit.identity}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{habit.tinyAct}</p>
      <p className="mt-1 text-sm text-muted">
        After {habit.cueRoutine}, in {habit.cuePlace}. Stay until the mark.
      </p>
      <div className="relative mx-auto mt-6 size-40">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="42" fill="none" className="text-sunken" stroke="currentColor" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            className="text-primary"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42 * t} ${2 * Math.PI * 42}`}
          />
        </svg>
        <p className="absolute inset-0 grid place-items-center font-display text-3xl tabular-nums">
          {formatClock(left)}
        </p>
      </div>
      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setPaused((p) => !p)}>
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            completeHabit(habit.id);
            onClose();
          }}
        >
          <Check className="size-4" />I did it
        </Button>
      </div>
    </Modal>
  );
}

export function AllVotesIn({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <Card className="mt-4 bg-primary text-primary-fg">
      <p className="font-display text-lg font-semibold">Today’s votes are in.</p>
      <p className="mt-1 text-sm opacity-90">
        Automaticity grows from repetition, not intensity. Come back after the next cue.
      </p>
    </Card>
  );
}
