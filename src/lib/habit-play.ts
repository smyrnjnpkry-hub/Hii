import type { Habit } from "./types.ts";
import { addDays, todayKey, weekday } from "./utils.ts";

export function isDoneOn(habit: Habit, date: string) {
  return habit.completions.some((c) => c.date === date);
}

export function isMissedOn(habit: Habit, date: string) {
  return habit.misses.some((m) => m.date === date);
}

export function isDueOn(habit: Habit, date: string) {
  return habit.daysOfWeek.includes(weekday(date));
}

export function scheduledDatesBack(habit: Habit, from: string, n: number) {
  const out: string[] = [];
  let date = from;
  let guard = 0;
  while (out.length < n && guard < 400) {
    if (isDueOn(habit, date)) out.push(date);
    date = addDays(date, -1);
    guard += 1;
  }
  return out;
}

/** Consecutive scheduled days completed, ending at today if done, else the previous scheduled day. */
export function scheduledStreak(habit: Habit, today = todayKey()) {
  let date = today;
  if (isDueOn(habit, today) && !isDoneOn(habit, today)) {
    date = addDays(today, -1);
  }
  let count = 0;
  let guard = 0;
  while (guard < 400) {
    if (!isDueOn(habit, date)) {
      date = addDays(date, -1);
      guard += 1;
      continue;
    }
    if (isDoneOn(habit, date)) {
      count += 1;
      date = addDays(date, -1);
      guard += 1;
      continue;
    }
    break;
  }
  return count;
}

export function longestStreak(habit: Habit, today = todayKey()) {
  const dates = scheduledDatesBack(habit, today, 365).reverse();
  let best = 0;
  let run = 0;
  for (const date of dates) {
    if (isDoneOn(habit, date)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

export type DayMark = {
  date: string;
  due: boolean;
  done: boolean;
  missed: boolean;
};

export function marksFor(habit: Habit, today = todayKey(), days = 28): DayMark[] {
  const born = habit.createdAt.slice(0, 10);
  const out: DayMark[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const due = date >= born && isDueOn(habit, date);
    out.push({
      date,
      due,
      done: due && isDoneOn(habit, date),
      missed: due && date !== today && (isMissedOn(habit, date) || !isDoneOn(habit, date)),
    });
  }
  return out;
}

export type ChainDay = {
  date: string;
  due: number;
  done: number;
  status: "empty" | "open" | "partial" | "full" | "missed";
};

export function dayChain(habits: Habit[], today = todayKey(), days = 7): ChainDay[] {
  const out: ChainDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const dueList = habits.filter(
      (h) => h.kind === "habit" && date >= h.createdAt.slice(0, 10) && isDueOn(h, date),
    );
    const due = dueList.length;
    const done = dueList.filter((h) => isDoneOn(h, date)).length;
    let status: ChainDay["status"] = "empty";
    if (due === 0) status = "empty";
    else if (done === due) status = "full";
    else if (date === today) status = done > 0 ? "partial" : "open";
    else if (done === 0) status = "missed";
    else status = "partial";
    out.push({ date, due, done, status });
  }
  return out;
}

export function todayVotes(habits: Habit[], today = todayKey()) {
  const due = habits.filter((h) => h.kind === "habit" && isDueOn(h, today));
  const done = due.filter((h) => isDoneOn(h, today));
  const next = due.find((h) => !isDoneOn(h, today)) ?? null;
  return {
    due: due.length,
    done: done.length,
    remaining: due.length - done.length,
    complete: due.length > 0 && done.length === due.length,
    next,
    dueHabits: due,
  };
}

/** Missed the previous scheduled day, and today is still open. New habits do not owe a past day. */
export function neverMissTwice(habit: Habit, today = todayKey()) {
  if (!isDueOn(habit, today) || isDoneOn(habit, today)) return false;
  const born = habit.createdAt.slice(0, 10);
  const prev = scheduledDatesBack(habit, addDays(today, -1), 1)[0];
  if (!prev || prev < born) return false;
  return !isDoneOn(habit, prev);
}

export function recoveryHabits(habits: Habit[], today = todayKey()) {
  return habits.filter((h) => h.kind === "habit" && neverMissTwice(h, today));
}

export function startSeconds(habit: Habit) {
  const mins = Math.max(0.5, Math.min(2, Number.parseFloat(habit.tinyAct.match(/(\d+(?:\.\d+)?)\s*min/)?.[1] ?? "2")));
  return Math.round(mins * 60);
}
