export type SoundId =
  | "chime"
  | "bell"
  | "ding"
  | "wood"
  | "beep"
  | "success";

export type NoiseId = "off" | "white" | "pink" | "brown" | "rain" | "fan";

export type RingColor = "sun" | "mint" | "sky" | "coral" | "ink";

export type Mood = "good" | "ok" | "low";

export type Step = {
  id: string;
  title: string;
  emoji: string;
  durationSec: number;
  note?: string;
};

export type RoutineReminder = {
  id: string;
  enabled: boolean;
  minutesBefore: number;
  sound: SoundId;
};

export type Routine = {
  id: string;
  name: string;
  emoji: string;
  steps: Step[];
  days: number[];
  startTime: string;
  anytime: boolean;
  reminders: RoutineReminder[];
  enabled: boolean;
  showIcons: boolean;
  showDays: boolean;
  showProgress: boolean;
  createdAt: number;
};

export type StandaloneReminder = {
  id: string;
  title: string;
  emoji: string;
  time: string;
  days: number[];
  enabled: boolean;
  sound: SoundId;
  note: string;
};

export type Completion = {
  id: string;
  routineId: string;
  date: string;
  startedAt: number;
  finishedAt: number;
  completedSteps: number;
  totalSteps: number;
  skippedSteps: number;
  durationSec: number;
  stepActualMs: number[];
  mood?: Mood;
};

export type RunStatus = "running" | "paused" | "overtime" | "done";

export type RunSession = {
  routineId: string;
  stepIndex: number;
  status: RunStatus;
  stepDurationMs: number;
  segmentStartedAt: number;
  elapsedBeforePause: number;
  skipped: number[];
  completed: number[];
  sessionStartedAt: number;
  spoken: Record<string, boolean>;
  stepActualMs: number[];
};

export type Settings = {
  displayName: string;
  plantName: string;
  onboardingDone: boolean;
  theme: "light" | "dark";
  voiceEnabled: boolean;
  soundEnabled: boolean;
  stepSound: SoundId;
  completeSound: SoundId;
  reminderSound: SoundId;
  whiteNoise: NoiseId;
  whiteNoiseVolume: number;
  autoNext: boolean;
  ringColor: RingColor;
  timerShowNext: boolean;
  timerShowAdjust: boolean;
  volume: number;
  notifyEnabled: boolean;
};

export type InAppAlert = {
  id: string;
  title: string;
  body: string;
  emoji: string;
  routineId?: string;
  createdAt: number;
};

export type Template = {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  category: "morning" | "night" | "focus" | "body" | "reset" | "adhd";
  startTime: string;
  anytime?: boolean;
  days: number[];
  steps: Omit<Step, "id">[];
};

export const DEFAULT_SETTINGS: Settings = {
  displayName: "",
  plantName: "Sprout",
  onboardingDone: false,
  theme: "light",
  voiceEnabled: true,
  soundEnabled: true,
  stepSound: "chime",
  completeSound: "success",
  reminderSound: "bell",
  whiteNoise: "off",
  whiteNoiseVolume: 0.22,
  autoNext: true,
  ringColor: "sun",
  timerShowNext: true,
  timerShowAdjust: true,
  volume: 0.75,
  notifyEnabled: false,
};

export const RING_HEX: Record<RingColor, string> = {
  sun: "#f5c400",
  mint: "#2f9e6b",
  sky: "#4d8fe8",
  coral: "#e86a4d",
  ink: "#1a1a24",
};

export const MOOD_META: Record<Mood, { emoji: string; label: string }> = {
  good: { emoji: "😊", label: "Good" },
  ok: { emoji: "😐", label: "Okay" },
  low: { emoji: "😔", label: "Low" },
};
