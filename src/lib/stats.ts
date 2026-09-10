import type { Completion, Routine } from "@/lib/types";
import { addMinutes, todayKey } from "@/lib/utils";

export function totalSec(routine: Routine) {
  return routine.steps.reduce((n, s) => n + s.durationSec, 0);
}

export function endTime(routine: Routine) {
  return addMinutes(routine.startTime, Math.round(totalSec(routine) / 60));
}

export function isScheduledToday(routine: Routine, d = new Date()) {
  if (!routine.enabled) return false;
  return routine.days.includes(d.getDay());
}

export function dayKeysBetween(from: string, to: string) {
  const out: string[] = [];
  const cur = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  while (cur <= end) {
    out.push(todayKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function datesWithCompletion(
  completions: Completion[],
  routineId?: string,
) {
  const set = new Set<string>();
  for (const c of completions) {
    if (routineId && c.routineId !== routineId) continue;
    if (c.completedSteps > 0) set.add(c.date);
  }
  return set;
}

export function currentStreak(completions: Completion[], routineId?: string) {
  const set = datesWithCompletion(completions, routineId);
  if (set.size === 0) return 0;
  const today = todayKey();
  const d = new Date(`${today}T00:00:00`);
  if (!set.has(today)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(todayKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function dayCount(completions: Completion[]) {
  if (completions.length === 0) return 0;
  const first = completions.reduce(
    (min, c) => (c.date < min ? c.date : min),
    completions[0].date,
  );
  const a = new Date(`${first}T00:00:00`).getTime();
  const b = new Date(`${todayKey()}T00:00:00`).getTime();
  return Math.max(1, Math.floor((b - a) / 86400000) + 1);
}

export function plantStage(streak: number) {
  if (streak <= 0) return { level: 0, name: "Seed", hint: "Start a routine to sprout." };
  if (streak < 3) return { level: 1, name: "Sprout", hint: "Keep showing up." };
  if (streak < 7) return { level: 2, name: "Seedling", hint: "A week grows roots." };
  if (streak < 14) return { level: 3, name: "Sapling", hint: "Two weeks of follow-through." };
  if (streak < 30) return { level: 4, name: "Young tree", hint: "A month of rails." };
  if (streak < 60) return { level: 5, name: "Tree", hint: "The habit is taking hold." };
  return { level: 6, name: "Grove", hint: "This is who you are now." };
}

export function completionsOn(completions: Completion[], date: string) {
  return completions.filter((c) => c.date === date);
}

export function weekKeys(from = new Date()) {
  const d = new Date(from);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return todayKey(x);
  });
}

export function lastNDays(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(todayKey(x));
  }
  return out;
}
