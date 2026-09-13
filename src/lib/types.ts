export type Pillar =
  | "spiritual"
  | "physical"
  | "intellectual"
  | "relational"
  | "emotional";

export type Season = "ordinary" | "hard";
export type ThemeMode = "light" | "dark" | "system";
export type Domain =
  | "body"
  | "craft"
  | "mind"
  | "people"
  | "admin"
  | "play";

export type SkillStage = "cognitive" | "associative" | "autonomous";
export type UnlearnPhase = "awareness" | "active";
export type MitStatus = "open" | "done" | "skipped";
export type RunStatus = "running" | "paused" | "overtime" | "done";
export type TaskPriority = 1 | 2 | 3 | 4;
export type TaskRepeat = "none" | "daily" | "weekly" | "weekdays" | "monthly";

export interface Scores {
  spiritual: number;
  physical: number;
  intellectual: number;
  relational: number;
  emotional: number;
}

export interface CheckIn {
  id: string;
  date: string;
  scores: Scores;
  note: string;
  actions: string[];
}

export interface EnvDesign {
  obvious: boolean;
  attractive: boolean;
  easy: boolean;
  satisfying: boolean;
}

export interface Habit {
  id: string;
  identity: string;
  tinyAct: string;
  fullAct: string;
  pillar: Pillar;
  cueRoutine: string;
  cuePlace: string;
  prompt: string;
  daysOfWeek: number[];
  reminder: string;
  ritualNote: string;
  keystone: boolean;
  createdAt: string;
  completions: { date: string; at: string }[];
  misses: { date: string }[];
  automaticity: { date: string; score: number }[];
  shrinkHistory: string[];
  env: EnvDesign;
  kind: "habit" | "mvi";
}

export interface JournalEntry {
  id: string;
  date: string;
  at: string;
  template: string;
  body: string;
  pillar?: Pillar;
}

export interface Mit {
  id: string;
  title: string;
  domain: Domain;
  startCue: string;
  due: string;
  carriedFrom?: string;
  status: MitStatus;
  aversiveness: number;
  feeling: string;
  firstSlice: string;
  reward: string;
  expectancy: number;
  value: number;
  starts: { at: string; minutes: number }[];
  woop?: { wish: string; outcome: string; obstacle: string; plan: string };
  bundleWant: string;
}

export interface DomainPlan {
  domain: Domain;
  weeklyOutcome: string;
  tinyAct: string;
  killCriterion: string;
}

export interface WeeklyReview {
  id: string;
  weekOf: string;
  cuesFired: string;
  stalled: string;
  friction: string;
  identityVote: string;
}

export interface Subskill {
  id: string;
  name: string;
  stage: SkillStage;
}

export interface PracticeSession {
  id: string;
  at: string;
  subskillId: string;
  target: string;
  minutes: number;
  difficulty: number;
  easy: boolean;
  feedback: string;
  nextChange: string;
}

export interface Skill {
  id: string;
  name: string;
  goodEnough: string;
  test: string;
  subskills: Subskill[];
  sessions: PracticeSession[];
  testScores: { at: string; score: number }[];
}

export interface CueMap {
  time: string;
  place: string;
  preceding: string;
  people: string;
  emotion: string;
  body: string;
}

export interface UrgeLog {
  id: string;
  at: string;
  date: string;
  place: string;
  feeling: string;
  acted: boolean;
  surfed: boolean;
}

export interface BadHabit {
  id: string;
  name: string;
  cue: CueMap;
  payoff: string;
  competingResponse: string;
  replacement: string;
  phase: UnlearnPhase;
  clinical: boolean;
  urgeLogs: UrgeLog[];
  lapses: { at: string; cue: string; note: string }[];
  friction: {
    invisible: boolean;
    unattractive: boolean;
    difficult: boolean;
    unsatisfying: boolean;
  };
}

export interface AgencyValue {
  name: string;
  weeklyBehavior: string;
  dont: string;
}

export interface ControlMap {
  control: string[];
  influence: string[];
  dont: string[];
}

export interface DailyAgency {
  date: string;
  mit: string;
  no: string;
  envEdit: string;
  votes: boolean[];
}

export interface FutureLetter {
  id: string;
  at: string;
  body: string;
}

export interface ContextReview {
  id: string;
  at: string;
  moments: { moment: string; redesign: string }[];
}

export interface Agency {
  values: AgencyValue[];
  identities: string[];
  control: ControlMap;
  daily: DailyAgency[];
  letters: FutureLetter[];
  reviews: ContextReview[];
}

export interface BrainDay {
  date: string;
  sleepHours: number;
  wakeTime: string;
  aerobicMin: number;
  strength: boolean;
  mindMeal: boolean;
  social: string;
  learnMin: number;
  downshift: boolean;
  drinks: number;
  smoked: boolean;
}

export interface CheckupDates {
  hearing: string;
  vision: string;
  clinician: string;
}

export interface Settings {
  onboarded: boolean;
  name: string;
  reminderTime: string;
  theme: ThemeMode;
  reduceMotion: boolean;
  season: Season;
  lastAutoMissDate: string;
}

export interface InAppAlert {
  id: string;
  title: string;
  body: string;
  at: number;
}

export interface RoutineStep {
  id: string;
  title: string;
  emoji: string;
  durationSec: number;
  note?: string;
}

export interface TimedRoutine {
  id: string;
  name: string;
  emoji: string;
  steps: RoutineStep[];
  days: number[];
  startTime: string;
  anytime: boolean;
  enabled: boolean;
  createdAt: number;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  category: "morning" | "night" | "focus" | "body" | "reset" | "adhd";
  startTime: string;
  anytime?: boolean;
  days: number[];
  steps: Omit<RoutineStep, "id">[];
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  date: string;
  startedAt: number;
  finishedAt: number;
  completedSteps: number;
  totalSteps: number;
  skippedSteps: number;
  durationSec: number;
}

export interface RunSession {
  routineId: string;
  stepIndex: number;
  status: RunStatus;
  stepDurationMs: number;
  segmentStartedAt: number;
  elapsedBeforePause: number;
  skipped: number[];
  completed: number[];
  sessionStartedAt: number;
}

export interface TaskProject {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  projectId: string;
  priority: TaskPriority;
  dueDate: string;
  reminder: string;
  repeat: TaskRepeat;
  completedAt: string | null;
  createdAt: string;
  carriedFrom?: string;
}

export const PILLARS: Pillar[] = [
  "spiritual",
  "physical",
  "intellectual",
  "relational",
  "emotional",
];

export const DOMAINS: Domain[] = [
  "body",
  "craft",
  "mind",
  "people",
  "admin",
  "play",
];

export const EMPTY_SCORES: Scores = {
  spiritual: 5,
  physical: 5,
  intellectual: 5,
  relational: 5,
  emotional: 5,
};

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  name: "",
  reminderTime: "08:00",
  theme: "system",
  reduceMotion: false,
  season: "ordinary",
  lastAutoMissDate: "",
};

export const DEFAULT_CONTROL: ControlMap = {
  control: ["The next two minutes", "Where my phone sleeps", "Who I text today"],
  influence: ["A conversation's tone", "A teammate's pace"],
  dont: ["Other people's moods", "The news cycle", "Yesterday"],
};

export const DEFAULT_AGENCY: Agency = {
  values: [],
  identities: [],
  control: DEFAULT_CONTROL,
  daily: [],
  letters: [],
  reviews: [],
};
