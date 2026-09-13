import type { Task, TaskProject, TaskRepeat } from "./types";
import { addDays, todayKey, uid, weekday } from "./utils";

export const DEFAULT_TASK_PROJECTS: TaskProject[] = [
  { id: "inbox", name: "Inbox" },
  { id: "work", name: "Work" },
  { id: "home", name: "Home" },
  { id: "health", name: "Health" },
];

export function seedTasks(day = todayKey()): Task[] {
  const yesterday = addDays(day, -1);
  const tomorrow = addDays(day, 1);
  const later = addDays(day, 3);
  return [
    {
      id: uid(),
      title: "Review tomorrow's calendar",
      notes: "Pick the one thing that actually matters.",
      projectId: "work",
      priority: 2,
      dueDate: day,
      reminder: "09:00",
      repeat: "weekdays",
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Drink a full glass of water",
      notes: "",
      projectId: "health",
      priority: 3,
      dueDate: day,
      reminder: "08:00",
      repeat: "daily",
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Call home for ten undistracted minutes",
      notes: "Phone in another room after.",
      projectId: "home",
      priority: 2,
      dueDate: day,
      reminder: "19:00",
      repeat: "none",
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Pay the electricity bill",
      notes: "Overdue — carried into Today.",
      projectId: "home",
      priority: 1,
      dueDate: yesterday,
      reminder: "10:00",
      repeat: "monthly",
      completedAt: null,
      createdAt: new Date().toISOString(),
      carriedFrom: yesterday,
    },
    {
      id: uid(),
      title: "Draft the ugly first paragraph",
      notes: "Open the file. One sentence is enough.",
      projectId: "work",
      priority: 1,
      dueDate: tomorrow,
      reminder: "11:00",
      repeat: "none",
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Buy greens and berries",
      notes: "MIND-pattern shop, not a heroic haul.",
      projectId: "health",
      priority: 3,
      dueDate: later,
      reminder: "",
      repeat: "none",
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Inbox triage — 10 minutes",
      notes: "",
      projectId: "inbox",
      priority: 4,
      dueDate: "",
      reminder: "",
      repeat: "none",
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function carryForwardTasks(tasks: Task[], today = todayKey()): Task[] {
  return tasks.map((t) => {
    if (!t.completedAt && t.dueDate && t.dueDate < today) {
      return { ...t, dueDate: today, carriedFrom: t.carriedFrom || t.dueDate };
    }
    return t;
  });
}

export function isInTodayView(t: Task, today = todayKey()) {
  if (t.completedAt) return false;
  if (!t.dueDate) return false;
  return t.dueDate <= today;
}

export function nextOccurrence(due: string, repeat: TaskRepeat, from = due): string {
  const base = from || todayKey();
  if (repeat === "daily") return addDays(base, 1);
  if (repeat === "weekly") return addDays(base, 7);
  if (repeat === "monthly") return addDays(base, 28);
  if (repeat === "weekdays") {
    let d = addDays(base, 1);
    while (weekday(d) === 0 || weekday(d) === 6) d = addDays(d, 1);
    return d;
  }
  return "";
}

export const PRIORITY_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "P1",
  2: "P2",
  3: "P3",
  4: "P4",
};
