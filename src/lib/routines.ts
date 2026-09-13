import type { RoutineTemplate, TimedRoutine } from "./types";
import { todayKey, uid } from "./utils";

const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "morning",
    name: "Morning Routine",
    emoji: "☀️",
    blurb: "Water, make the bed, stretch, and start the day on rails.",
    category: "morning",
    startTime: "06:30",
    days: EVERYDAY,
    steps: [
      { title: "Drink water", emoji: "💧", durationSec: 60 },
      { title: "Make the bed", emoji: "🛏️", durationSec: 120 },
      { title: "Open the blinds", emoji: "🪟", durationSec: 60 },
      { title: "Stretch", emoji: "🧘", durationSec: 300 },
      { title: "Shower", emoji: "🚿", durationSec: 600 },
      { title: "Get dressed", emoji: "👕", durationSec: 300 },
      { title: "Breakfast", emoji: "🥣", durationSec: 900 },
      { title: "Plan the day", emoji: "📝", durationSec: 300 },
    ],
  },
  {
    id: "night",
    name: "Night Wind-Down",
    emoji: "🌙",
    blurb: "Evening reset that actually ends the day.",
    category: "night",
    startTime: "21:30",
    days: EVERYDAY,
    steps: [
      { title: "Tidy one surface", emoji: "🧹", durationSec: 180 },
      { title: "Phone on charger", emoji: "📵", durationSec: 120 },
      { title: "Skincare", emoji: "🧴", durationSec: 480 },
      { title: "Journal three lines", emoji: "📓", durationSec: 300 },
      { title: "Tomorrow's top 3", emoji: "✅", durationSec: 180 },
      { title: "Read", emoji: "📖", durationSec: 600 },
      { title: "Lights out breath", emoji: "🕯️", durationSec: 120 },
    ],
  },
  {
    id: "adhd-start",
    name: "Just Start",
    emoji: "⚡",
    blurb: "Tiny first steps when starting is the whole problem.",
    category: "adhd",
    startTime: "09:00",
    anytime: true,
    days: EVERYDAY,
    steps: [
      { title: "Stand up", emoji: "🧍", durationSec: 30 },
      { title: "Drink water", emoji: "💧", durationSec: 45 },
      { title: "Put on shoes", emoji: "👟", durationSec: 60 },
      { title: "2-minute tidy", emoji: "🧹", durationSec: 120 },
      { title: "Open the task", emoji: "📂", durationSec: 60 },
      { title: "Work for 10", emoji: "⏱️", durationSec: 600 },
    ],
  },
  {
    id: "pomo",
    name: "Focus Pomodoro",
    emoji: "🍅",
    blurb: "Four deep-work blocks with short breaks.",
    category: "focus",
    startTime: "09:00",
    anytime: true,
    days: WEEKDAYS,
    steps: [
      { title: "Focus", emoji: "🎯", durationSec: 1500 },
      { title: "Short break", emoji: "☕", durationSec: 300 },
      { title: "Focus", emoji: "🎯", durationSec: 1500 },
      { title: "Short break", emoji: "🌿", durationSec: 300 },
      { title: "Focus", emoji: "🎯", durationSec: 1500 },
      { title: "Short break", emoji: "💧", durationSec: 300 },
      { title: "Focus", emoji: "🎯", durationSec: 1500 },
      { title: "Long break", emoji: "🚶", durationSec: 900 },
    ],
  },
  {
    id: "workout",
    name: "Workout",
    emoji: "💪",
    blurb: "Warm up, move, stretch. A session you can finish.",
    category: "body",
    startTime: "07:30",
    days: [1, 3, 5, 0],
    steps: [
      { title: "Warm up", emoji: "🔥", durationSec: 300 },
      { title: "Strength", emoji: "🏋️", durationSec: 1200 },
      { title: "Cardio burst", emoji: "🏃", durationSec: 600 },
      { title: "Stretch", emoji: "🤸", durationSec: 300 },
      { title: "Cool down", emoji: "😌", durationSec: 180 },
    ],
  },
  {
    id: "daily-reset",
    name: "Daily Reset",
    emoji: "🔄",
    blurb: "A 20-minute sweep so tomorrow-you walks into a clear room.",
    category: "reset",
    startTime: "20:00",
    days: EVERYDAY,
    steps: [
      { title: "Dishes", emoji: "🍽️", durationSec: 480 },
      { title: "Wipe counters", emoji: "✨", durationSec: 180 },
      { title: "Laundry in the hamper", emoji: "🧺", durationSec: 180 },
      { title: "Bag by the door", emoji: "🎒", durationSec: 120 },
      { title: "Tomorrow clothes", emoji: "👔", durationSec: 180 },
    ],
  },
  {
    id: "selfcare",
    name: "Self-Care Reset",
    emoji: "🌿",
    blurb: "Small, obvious next steps when the day feels too loud.",
    category: "adhd",
    startTime: "16:00",
    anytime: true,
    days: EVERYDAY,
    steps: [
      { title: "Drink water", emoji: "💧", durationSec: 60 },
      { title: "Step outside", emoji: "🌤️", durationSec: 180 },
      { title: "Body scan", emoji: "🫀", durationSec: 180 },
      { title: "One kind task", emoji: "💛", durationSec: 300 },
      { title: "Eat something real", emoji: "🍎", durationSec: 480 },
    ],
  },
  {
    id: "yoga",
    name: "Yoga Flow",
    emoji: "🧘",
    blurb: "A short mat session you can finish before breakfast.",
    category: "body",
    startTime: "07:00",
    days: EVERYDAY,
    steps: [
      { title: "Roll out the mat", emoji: "🧘", durationSec: 60 },
      { title: "Sun salutations", emoji: "🌅", durationSec: 480 },
      { title: "Standing poses", emoji: "🧍", durationSec: 360 },
      { title: "Floor stretch", emoji: "🤸", durationSec: 300 },
      { title: "Savasana", emoji: "😌", durationSec: 180 },
    ],
  },
];

export function templateToRoutine(t: RoutineTemplate, id: string = uid()): TimedRoutine {
  return {
    id,
    name: t.name,
    emoji: t.emoji,
    steps: t.steps.map((s) => ({ ...s, id: uid() })),
    days: [...t.days],
    startTime: t.startTime,
    anytime: Boolean(t.anytime),
    enabled: true,
    createdAt: Date.now(),
  };
}

export function blankRoutine(): TimedRoutine {
  return {
    id: uid(),
    name: "New routine",
    emoji: "☀️",
    steps: [{ id: uid(), title: "First step", emoji: "💧", durationSec: 60 }],
    days: EVERYDAY,
    startTime: "07:00",
    anytime: false,
    enabled: true,
    createdAt: Date.now(),
  };
}

export function seedRoutines(): TimedRoutine[] {
  const morning = ROUTINE_TEMPLATES.find((t) => t.id === "morning")!;
  const night = ROUTINE_TEMPLATES.find((t) => t.id === "night")!;
  const start = ROUTINE_TEMPLATES.find((t) => t.id === "adhd-start")!;
  return [
    templateToRoutine(morning, "seed-morning"),
    templateToRoutine(night, "seed-night"),
    templateToRoutine(start, "seed-start"),
  ];
}

export function totalSec(routine: TimedRoutine) {
  return routine.steps.reduce((n, s) => n + s.durationSec, 0);
}

export function isScheduledToday(routine: TimedRoutine, d = new Date()) {
  if (!routine.enabled) return false;
  return routine.days.includes(d.getDay());
}

export function remainingMs(
  session: {
    status: string;
    elapsedBeforePause: number;
    segmentStartedAt: number;
    stepDurationMs: number;
  },
  now = Date.now(),
) {
  const elapsed =
    session.status === "paused"
      ? session.elapsedBeforePause
      : session.elapsedBeforePause + (now - session.segmentStartedAt);
  return session.stepDurationMs - elapsed;
}

export function checkKey(date: string, routineId: string) {
  return `${date}:${routineId}`;
}

export function todayCheckKey(routineId: string) {
  return checkKey(todayKey(), routineId);
}
