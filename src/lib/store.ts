import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Agency,
  BadHabit,
  BrainDay,
  CheckIn,
  CheckupDates,
  ContextReview,
  DailyAgency,
  Domain,
  DomainPlan,
  FutureLetter,
  Habit,
  InAppAlert,
  JournalEntry,
  Mit,
  Pillar,
  PracticeSession,
  RoutineCompletion,
  RoutineStep,
  RoutineTemplate,
  RunSession,
  Season,
  Settings,
  Skill,
  Scores,
  Task,
  TaskProject,
  TimedRoutine,
  UrgeLog,
  WeeklyReview,
} from "./types";
import {
  DEFAULT_AGENCY,
  DEFAULT_SETTINGS,
  DOMAINS,
  PILLARS,
} from "./types";
import { addDays, shrinkAct, todayKey, uid, weekday, weekStart } from "./utils";
import { blankRoutine, checkKey, seedRoutines, templateToRoutine } from "./routines";
import { carryForwardTasks as applyCarryForward, DEFAULT_TASK_PROJECTS, nextOccurrence, seedTasks } from "./tasks";

export const DOW_DEFAULT = [1, 3, 5];

function emptyPlans(): DomainPlan[] {
  return DOMAINS.map((domain) => ({
    domain,
    weeklyOutcome: "",
    tinyAct: "",
    killCriterion: "",
  }));
}

function seedMits(day: string): Mit[] {
  return [
    {
      id: uid(),
      title: "Write the first ugly paragraph",
      domain: "craft",
      startCue: "After I pour coffee, at the desk",
      due: day,
      status: "open",
      aversiveness: 3,
      feeling: "",
      firstSlice: "Open the document and write one sentence",
      reward: "Tea after",
      expectancy: 6,
      value: 8,
      starts: [],
      bundleWant: "",
    },
    {
      id: uid(),
      title: "Ten-minute walk outside",
      domain: "body",
      startCue: "After lunch, at the door",
      due: day,
      status: "open",
      aversiveness: 2,
      feeling: "",
      firstSlice: "Put on shoes",
      reward: "Sunlight",
      expectancy: 8,
      value: 7,
      starts: [],
      bundleWant: "Podcast only on the walk",
    },
    {
      id: uid(),
      title: "Send one undistracted check-in",
      domain: "people",
      startCue: "After the walk, on the sofa",
      due: day,
      status: "open",
      aversiveness: 2,
      feeling: "",
      firstSlice: "Open messages and type the first line",
      reward: "Nothing extra",
      expectancy: 7,
      value: 8,
      starts: [],
      bundleWant: "",
    },
  ];
}

function seedSkill(): Skill {
  return {
    id: uid(),
    name: "Conversational presence",
    goodEnough:
      "Hold a 3-minute undistracted conversation and ask one real follow-up",
    test: "Record a 3-minute conversation or a 3-minute spoken recap. Score 1–10 on presence.",
    subskills: [
      { id: uid(), name: "Ask, then wait", stage: "cognitive" },
      { id: uid(), name: "Paraphrase before advice", stage: "cognitive" },
      { id: uid(), name: "Phone out of reach", stage: "associative" },
    ],
    sessions: [],
    testScores: [],
  };
}

function seedUnlearn(): BadHabit {
  return {
    id: uid(),
    name: "I open a feed in bed",
    cue: {
      time: "Night, after lights dim",
      place: "Bed",
      preceding: "Plug in charger on the nightstand",
      people: "Alone",
      emotion: "Tired, a little lonely",
      body: "Heavy eyes, restless hands",
    },
    payoff: "Numb the in-between before sleep",
    competingResponse: "Phone goes to the kitchen. Two-minute stretch beside the bed.",
    replacement: "Charge the phone in the kitchen, then stretch for two minutes",
    phase: "awareness",
    clinical: false,
    urgeLogs: [],
    lapses: [],
    friction: {
      invisible: false,
      unattractive: false,
      difficult: false,
      unsatisfying: false,
    },
  };
}

export interface PersistShape {
  settings: Settings;
  checkIns: CheckIn[];
  habits: Habit[];
  journal: JournalEntry[];
  mits: Mit[];
  plans: DomainPlan[];
  reviews: WeeklyReview[];
  skill: Skill | null;
  unlearn: BadHabit | null;
  agency: Agency;
  brain: BrainDay[];
  checkups: CheckupDates;
  sleepLog: { date: string; hours: number }[];
  hardStairs: Record<string, string>;
  alerts: InAppAlert[];
  firedKeys: string[];
  drillBest: { speed: number; reason: number };
  routines: TimedRoutine[];
  completions: RoutineCompletion[];
  checks: Record<string, string[]>;
  routinesSeeded: boolean;
  tasks: Task[];
  taskProjects: TaskProject[];
  tasksSeeded: boolean;
}

interface AppState extends PersistShape {
  hydrated: boolean;
  setHydrated: () => void;
  hydrateDay: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  completeOnboarding: (p: {
    name: string;
    reminderTime: string;
    scores: Scores;
    identity: string;
    tinyAct: string;
    cueRoutine: string;
    cuePlace: string;
    prompt: string;
    pillar: Pillar;
  }) => void;
  saveCheckIn: (scores: Scores, note: string, actions: string[]) => void;
  setSeason: (season: Season) => void;
  addHabit: (h: Omit<Habit, "id" | "createdAt" | "completions" | "misses" | "automaticity" | "shrinkHistory">) => string;
  completeHabit: (id: string, date?: string) => void;
  missHabit: (id: string, date?: string) => void;
  shrinkHabit: (id: string) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  scoreAutomaticity: (id: string, score: number) => void;
  addJournal: (template: string, body: string, pillar?: Pillar) => void;
  deleteJournal: (id: string) => void;
  addMit: (partial?: Partial<Mit>) => string;
  updateMit: (id: string, patch: Partial<Mit>) => void;
  completeMit: (id: string) => void;
  skipMit: (id: string, feeling: string) => void;
  logStart: (id: string, minutes: number) => void;
  carryForward: () => void;
  setPlan: (domain: Domain, patch: Partial<DomainPlan>) => void;
  addReview: (r: Omit<WeeklyReview, "id">) => void;
  setSkill: (s: Skill) => void;
  addSession: (s: Omit<PracticeSession, "id" | "at">) => void;
  addTestScore: (score: number) => void;
  setUnlearn: (b: BadHabit) => void;
  logUrge: (u: Omit<UrgeLog, "id" | "at" | "date">) => void;
  logLapse: (cue: string, note: string) => void;
  setAgency: (patch: Partial<Agency>) => void;
  saveDailyAgency: (d: Omit<DailyAgency, "date">) => void;
  addLetter: (body: string) => void;
  addContextReview: (r: Omit<ContextReview, "id" | "at">) => void;
  upsertBrain: (patch: Partial<BrainDay>) => void;
  logSleep: (hours: number) => void;
  setCheckups: (patch: Partial<CheckupDates>) => void;
  setHardStair: (id: string, value: string) => void;
  pushAlert: (title: string, body: string) => void;
  dismissAlert: (id: string) => void;
  markFired: (key: string) => void;
  setDrillBest: (kind: "speed" | "reason", n: number) => void;
  exportJson: () => string;
  wipeAll: () => void;
  session: RunSession | null;
  ensureRoutines: () => void;
  addFromTemplate: (t: RoutineTemplate) => string;
  addBlankRoutine: () => string;
  saveRoutine: (routine: TimedRoutine) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutine: (id: string) => void;
  saveStep: (routineId: string, step: RoutineStep) => void;
  addStep: (routineId: string, step?: Partial<RoutineStep>) => void;
  deleteStep: (routineId: string, stepId: string) => void;
  moveStep: (routineId: string, from: number, to: number) => void;
  toggleCheck: (routineId: string, stepId: string, date?: string) => void;
  startRun: (routineId: string) => void;
  pauseRun: () => void;
  resumeRun: () => void;
  adjustTime: (deltaMs: number) => void;
  completeStep: () => void;
  skipStep: () => void;
  abortRun: () => void;
  ensureTasks: () => void;
  addTask: (partial?: Partial<Task>) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addTaskProject: (name: string) => string;
  carryForwardTasks: () => void;
}

const emptyPersist = (): PersistShape => ({
  settings: { ...DEFAULT_SETTINGS },
  checkIns: [],
  habits: [],
  journal: [],
  mits: [],
  plans: emptyPlans(),
  reviews: [],
  skill: null,
  unlearn: null,
  agency: structuredClone(DEFAULT_AGENCY),
  brain: [],
  checkups: { hearing: "", vision: "", clinician: "" },
  sleepLog: [],
  hardStairs: {},
  alerts: [],
  firedKeys: [],
  drillBest: { speed: 0, reason: 0 },
  routines: [],
  completions: [],
  checks: {},
  routinesSeeded: false,
  tasks: [],
  taskProjects: DEFAULT_TASK_PROJECTS,
  tasksSeeded: false,
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...emptyPersist(),
      hydrated: false,
      session: null,
      setHydrated: () => set({ hydrated: true }),
      hydrateDay: () => {
        const s = get();
        const today = todayKey();
        if (!s.settings.onboarded) return;
        get().ensureRoutines();
        get().ensureTasks();
        get().carryForward();
        get().carryForwardTasks();
        if (s.settings.lastAutoMissDate === today) return;
        const dow = weekday(today);
        const habits = s.habits.map((h) => {
          if (!h.daysOfWeek.includes(dow)) return h;
          if (h.completions.some((c) => c.date === today)) return h;
          if (h.misses.some((m) => m.date === today)) return h;
          return h;
        });
        set({ habits, settings: { ...s.settings, lastAutoMissDate: today } });
      },
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      completeOnboarding: (p) => {
        const today = todayKey();
        const habit: Habit = {
          id: uid(),
          identity: p.identity,
          tinyAct: p.tinyAct,
          fullAct: p.tinyAct,
          pillar: p.pillar,
          cueRoutine: p.cueRoutine,
          cuePlace: p.cuePlace,
          prompt: p.prompt,
          daysOfWeek: DOW_DEFAULT,
          reminder: p.reminderTime,
          ritualNote: "",
          keystone: true,
          createdAt: new Date().toISOString(),
          completions: [],
          misses: [],
          automaticity: [],
          shrinkHistory: [],
          env: { obvious: true, attractive: true, easy: true, satisfying: false },
          kind: "habit",
        };
        set({
          settings: {
            ...DEFAULT_SETTINGS,
            ...get().settings,
            onboarded: true,
            name: p.name,
            reminderTime: p.reminderTime,
          },
          checkIns: [
            {
              id: uid(),
              date: today,
              scores: p.scores,
              note: "First check-in",
              actions: [],
            },
          ],
          habits: [habit],
          mits: seedMits(today),
          skill: seedSkill(),
          unlearn: seedUnlearn(),
          agency: {
            ...structuredClone(DEFAULT_AGENCY),
            identities: [p.identity],
            values: [
              { name: "Health", weeklyBehavior: "Protect sleep and a daily walk", dont: "Trade rest for heroic hours" },
              { name: "Craft", weeklyBehavior: "One ugly first minute on the real work", dont: "Hide in busywork" },
              { name: "People", weeklyBehavior: "One undistracted contact", dont: "Perform connection" },
            ],
          },
          routines: seedRoutines(),
          routinesSeeded: true,
          tasks: seedTasks(today),
          taskProjects: DEFAULT_TASK_PROJECTS,
          tasksSeeded: true,
        });
      },
      saveCheckIn: (scores, note, actions) => {
        const today = todayKey();
        set((s) => {
          const rest = s.checkIns.filter((c) => c.date !== today);
          return {
            checkIns: [
              { id: uid(), date: today, scores, note, actions },
              ...rest,
            ],
          };
        });
      },
      setSeason: (season) =>
        set((s) => ({ settings: { ...s.settings, season } })),
      addHabit: (h) => {
        const id = uid();
        const live = get().habits.filter((x) => x.kind === "habit").length;
        if (live >= 3 && h.kind === "habit") return "";
        set((s) => ({
          habits: [
            {
              ...h,
              id,
              createdAt: new Date().toISOString(),
              completions: [],
              misses: [],
              automaticity: [],
              shrinkHistory: [],
            },
            ...s.habits,
          ],
        }));
        return id;
      },
      completeHabit: (id, date = todayKey()) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  misses: h.misses.filter((m) => m.date !== date),
                  completions: h.completions.some((c) => c.date === date)
                    ? h.completions
                    : [{ date, at: new Date().toISOString() }, ...h.completions],
                }
              : h,
          ),
        })),
      missHabit: (id, date = todayKey()) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completions: h.completions.filter((c) => c.date !== date),
                  misses: h.misses.some((m) => m.date === date)
                    ? h.misses
                    : [{ date }, ...h.misses],
                }
              : h,
          ),
        })),
      shrinkHabit: (id) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const next = shrinkAct(h.tinyAct);
            return {
              ...h,
              tinyAct: next,
              shrinkHistory: [h.tinyAct, ...h.shrinkHistory].slice(0, 8),
            };
          }),
        })),
      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch, id: h.id } : h)),
        })),
      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      scoreAutomaticity: (id, score) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  automaticity: [
                    { date: todayKey(), score },
                    ...h.automaticity.filter((a) => a.date !== todayKey()),
                  ],
                }
              : h,
          ),
        })),
      addJournal: (template, body, pillar) =>
        set((s) => ({
          journal: [
            {
              id: uid(),
              date: todayKey(),
              at: new Date().toISOString(),
              template,
              body,
              pillar,
            },
            ...s.journal,
          ],
        })),
      deleteJournal: (id) =>
        set((s) => ({ journal: s.journal.filter((j) => j.id !== id) })),
      addMit: (partial) => {
        const open = get().mits.filter(
          (m) => m.status === "open" && m.due === todayKey(),
        ).length;
        if (open >= 3) return "";
        const id = uid();
        const mit: Mit = {
          id,
          title: partial?.title || "Untitled",
          domain: partial?.domain || "craft",
          startCue: partial?.startCue || "After I sit down, at the desk",
          due: partial?.due || todayKey(),
          status: "open",
          aversiveness: partial?.aversiveness ?? 3,
          feeling: "",
          firstSlice: partial?.firstSlice || "The first two minutes",
          reward: partial?.reward || "Tea after",
          expectancy: partial?.expectancy ?? 6,
          value: partial?.value ?? 6,
          starts: [],
          bundleWant: partial?.bundleWant || "",
          woop: partial?.woop,
        };
        set((s) => ({ mits: [mit, ...s.mits] }));
        return id;
      },
      updateMit: (id, patch) =>
        set((s) => ({
          mits: s.mits.map((m) => (m.id === id ? { ...m, ...patch, id: m.id } : m)),
        })),
      completeMit: (id) =>
        set((s) => ({
          mits: s.mits.map((m) => (m.id === id ? { ...m, status: "done" } : m)),
        })),
      skipMit: (id, feeling) =>
        set((s) => ({
          mits: s.mits.map((m) =>
            m.id === id ? { ...m, status: "skipped", feeling } : m,
          ),
        })),
      logStart: (id, minutes) =>
        set((s) => ({
          mits: s.mits.map((m) =>
            m.id === id
              ? {
                  ...m,
                  starts: [{ at: new Date().toISOString(), minutes }, ...m.starts],
                }
              : m,
          ),
        })),
      carryForward: () => {
        const today = todayKey();
        set((s) => ({
          mits: s.mits.map((m) => {
            if (m.status !== "open") return m;
            if (m.due >= today) return m;
            return { ...m, carriedFrom: m.carriedFrom || m.due, due: today };
          }),
        }));
      },
      setPlan: (domain, patch) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.domain === domain ? { ...p, ...patch } : p)),
        })),
      addReview: (r) =>
        set((s) => ({ reviews: [{ id: uid(), ...r }, ...s.reviews] })),
      setSkill: (skill) => set({ skill }),
      addSession: (sess) =>
        set((s) => {
          if (!s.skill) return s;
          const session: PracticeSession = {
            ...sess,
            id: uid(),
            at: new Date().toISOString(),
          };
          let subskills = s.skill.subskills;
          if (sess.easy) {
            subskills = subskills.map((sub) =>
              sub.id === sess.subskillId && sub.stage !== "autonomous"
                ? {
                    ...sub,
                    stage:
                      sub.stage === "cognitive" ? "associative" : "autonomous",
                  }
                : sub,
            );
          }
          return { skill: { ...s.skill, sessions: [session, ...s.skill.sessions], subskills } };
        }),
      addTestScore: (score) =>
        set((s) => {
          if (!s.skill) return s;
          return {
            skill: {
              ...s.skill,
              testScores: [
                { at: new Date().toISOString(), score },
                ...s.skill.testScores,
              ],
            },
          };
        }),
      setUnlearn: (unlearn) => set({ unlearn }),
      logUrge: (u) =>
        set((s) => {
          if (!s.unlearn) return s;
          const log: UrgeLog = {
            ...u,
            id: uid(),
            at: new Date().toISOString(),
            date: todayKey(),
          };
          const logs = [log, ...s.unlearn.urgeLogs];
          const days = new Set(logs.map((l) => l.date));
          const phase: BadHabit["phase"] =
            days.size >= 3 ? "active" : s.unlearn.phase;
          return { unlearn: { ...s.unlearn, urgeLogs: logs, phase } };
        }),
      logLapse: (cue, note) =>
        set((s) => {
          if (!s.unlearn) return s;
          return {
            unlearn: {
              ...s.unlearn,
              lapses: [
                { at: new Date().toISOString(), cue, note },
                ...s.unlearn.lapses,
              ],
            },
          };
        }),
      setAgency: (patch) =>
        set((s) => ({ agency: { ...s.agency, ...patch } })),
      saveDailyAgency: (d) =>
        set((s) => ({
          agency: {
            ...s.agency,
            daily: [
              { ...d, date: todayKey() },
              ...s.agency.daily.filter((x) => x.date !== todayKey()),
            ],
          },
        })),
      addLetter: (body) =>
        set((s) => ({
          agency: {
            ...s.agency,
            letters: [
              { id: uid(), at: new Date().toISOString(), body },
              ...s.agency.letters,
            ],
          },
        })),
      addContextReview: (r) =>
        set((s) => ({
          agency: {
            ...s.agency,
            reviews: [
              { id: uid(), at: new Date().toISOString(), ...r },
              ...s.agency.reviews,
            ],
          },
        })),
      upsertBrain: (patch) =>
        set((s) => {
          const date = todayKey();
          const cur = s.brain.find((b) => b.date === date) ?? {
            date,
            sleepHours: 0,
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
          return {
            brain: [{ ...cur, ...patch, date }, ...s.brain.filter((b) => b.date !== date)],
          };
        }),
      logSleep: (hours) =>
        set((s) => ({
          sleepLog: [
            { date: todayKey(), hours },
            ...s.sleepLog.filter((x) => x.date !== todayKey()),
          ],
        })),
      setCheckups: (patch) =>
        set((s) => ({ checkups: { ...s.checkups, ...patch } })),
      setHardStair: (id, value) =>
        set((s) => ({ hardStairs: { ...s.hardStairs, [id]: value } })),
      pushAlert: (title, body) =>
        set((s) => ({
          alerts: [
            { id: uid(), title, body, at: Date.now() },
            ...s.alerts,
          ].slice(0, 6),
        })),
      dismissAlert: (id) =>
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      markFired: (key) =>
        set((s) => ({ firedKeys: [...s.firedKeys, key].slice(-80) })),
      setDrillBest: (kind, n) =>
        set((s) => ({ drillBest: { ...s.drillBest, [kind]: n } })),
      exportJson: () => {
        const s = get();
        const { hydrated, ...rest } = s;
        void hydrated;
        const dump: Record<string, unknown> = {};
        for (const k of Object.keys(emptyPersist()) as (keyof PersistShape)[]) {
          dump[k] = rest[k];
        }
        return JSON.stringify(dump, null, 2);
      },
      wipeAll: () => set({ ...emptyPersist(), hydrated: true, session: null }),
      ensureRoutines: () => {
        const s = get();
        if (s.routinesSeeded) return;
        set({
          routines: s.routines.length ? s.routines : seedRoutines(),
          routinesSeeded: true,
        });
      },
      addFromTemplate: (t) => {
        const routine = templateToRoutine(t);
        set((s) => ({ routines: [routine, ...s.routines] }));
        return routine.id;
      },
      addBlankRoutine: () => {
        const routine = blankRoutine();
        set((s) => ({ routines: [routine, ...s.routines] }));
        return routine.id;
      },
      saveRoutine: (routine) =>
        set((s) => ({
          routines: s.routines.map((r) => (r.id === routine.id ? routine : r)),
        })),
      deleteRoutine: (id) =>
        set((s) => ({
          routines: s.routines.filter((r) => r.id !== id),
          session: s.session?.routineId === id ? null : s.session,
        })),
      toggleRoutine: (id) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r,
          ),
        })),
      saveStep: (routineId, step) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? { ...r, steps: r.steps.map((x) => (x.id === step.id ? step : x)) }
              : r,
          ),
        })),
      addStep: (routineId, partial) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  steps: [
                    ...r.steps,
                    {
                      id: uid(),
                      title: partial?.title ?? "New step",
                      emoji: partial?.emoji ?? "⭐",
                      durationSec: partial?.durationSec ?? 60,
                      note: partial?.note,
                    },
                  ],
                }
              : r,
          ),
        })),
      deleteStep: (routineId, stepId) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? { ...r, steps: r.steps.filter((x) => x.id !== stepId) }
              : r,
          ),
        })),
      moveStep: (routineId, from, to) =>
        set((s) => ({
          routines: s.routines.map((r) => {
            if (r.id !== routineId) return r;
            if (to < 0 || to >= r.steps.length) return r;
            const steps = [...r.steps];
            const [item] = steps.splice(from, 1);
            steps.splice(to, 0, item);
            return { ...r, steps };
          }),
        })),
      toggleCheck: (routineId, stepId, date = todayKey()) => {
        const key = checkKey(date, routineId);
        set((s) => {
          const current = s.checks[key] ?? [];
          const next = current.includes(stepId)
            ? current.filter((id) => id !== stepId)
            : [...current, stepId];
          const checks = { ...s.checks, [key]: next };
          const routine = s.routines.find((r) => r.id === routineId);
          let completions = s.completions;
          if (routine && next.length === routine.steps.length && routine.steps.length > 0) {
            const already = completions.some(
              (c) => c.routineId === routineId && c.date === date,
            );
            if (!already) {
              completions = [
                {
                  id: uid(),
                  routineId,
                  date,
                  startedAt: Date.now(),
                  finishedAt: Date.now(),
                  completedSteps: routine.steps.length,
                  totalSteps: routine.steps.length,
                  skippedSteps: 0,
                  durationSec: 0,
                },
                ...completions,
              ];
            }
          }
          return { checks, completions };
        });
      },
      startRun: (routineId) => {
        const routine = get().routines.find((r) => r.id === routineId);
        if (!routine || routine.steps.length === 0) return;
        const first = routine.steps[0];
        set({
          session: {
            routineId,
            stepIndex: 0,
            status: "running",
            stepDurationMs: first.durationSec * 1000,
            segmentStartedAt: Date.now(),
            elapsedBeforePause: 0,
            skipped: [],
            completed: [],
            sessionStartedAt: Date.now(),
          },
        });
      },
      pauseRun: () => {
        const session = get().session;
        if (!session || session.status !== "running") return;
        set({
          session: {
            ...session,
            status: "paused",
            elapsedBeforePause:
              session.elapsedBeforePause + (Date.now() - session.segmentStartedAt),
          },
        });
      },
      resumeRun: () => {
        const session = get().session;
        if (!session || (session.status !== "paused" && session.status !== "overtime")) return;
        set({
          session: {
            ...session,
            status: "running",
            segmentStartedAt: Date.now(),
          },
        });
      },
      adjustTime: (deltaMs) => {
        const session = get().session;
        if (!session) return;
        set({
          session: {
            ...session,
            stepDurationMs: Math.max(5000, session.stepDurationMs + deltaMs),
          },
        });
      },
      completeStep: () => {
        const { session, routines } = get();
        if (!session) return;
        const routine = routines.find((r) => r.id === session.routineId);
        if (!routine) return;
        const now = Date.now();
        const completed = session.completed.includes(session.stepIndex)
          ? session.completed
          : [...session.completed, session.stepIndex];
        const nextIndex = session.stepIndex + 1;
        if (nextIndex >= routine.steps.length) {
          const doneSession: RunSession = { ...session, status: "done", completed };
          const completion: RoutineCompletion = {
            id: uid(),
            routineId: routine.id,
            date: todayKey(),
            startedAt: doneSession.sessionStartedAt,
            finishedAt: now,
            completedSteps: completed.length,
            totalSteps: routine.steps.length,
            skippedSteps: session.skipped.length,
            durationSec: Math.round((now - doneSession.sessionStartedAt) / 1000),
          };
          set((s) => ({
            session: doneSession,
            completions: [completion, ...s.completions],
          }));
          return;
        }
        const next = routine.steps[nextIndex];
        set({
          session: {
            ...session,
            stepIndex: nextIndex,
            status: "running",
            stepDurationMs: next.durationSec * 1000,
            segmentStartedAt: now,
            elapsedBeforePause: 0,
            completed,
          },
        });
      },
      skipStep: () => {
        const { session, routines } = get();
        if (!session) return;
        const routine = routines.find((r) => r.id === session.routineId);
        if (!routine) return;
        const now = Date.now();
        const skipped = session.skipped.includes(session.stepIndex)
          ? session.skipped
          : [...session.skipped, session.stepIndex];
        const nextIndex = session.stepIndex + 1;
        if (nextIndex >= routine.steps.length) {
          const doneSession: RunSession = { ...session, status: "done", skipped };
          const completion: RoutineCompletion = {
            id: uid(),
            routineId: routine.id,
            date: todayKey(),
            startedAt: doneSession.sessionStartedAt,
            finishedAt: now,
            completedSteps: session.completed.length,
            totalSteps: routine.steps.length,
            skippedSteps: skipped.length,
            durationSec: Math.round((now - doneSession.sessionStartedAt) / 1000),
          };
          set((s) => ({
            session: doneSession,
            completions: [completion, ...s.completions],
          }));
          return;
        }
        const next = routine.steps[nextIndex];
        set({
          session: {
            ...session,
            stepIndex: nextIndex,
            status: "running",
            stepDurationMs: next.durationSec * 1000,
            segmentStartedAt: now,
            elapsedBeforePause: 0,
            skipped,
          },
        });
      },
      abortRun: () => set({ session: null }),
      ensureTasks: () => {
        const s = get();
        if (s.tasksSeeded) return;
        set({
          tasks: s.tasks.length ? s.tasks : seedTasks(),
          taskProjects: s.taskProjects.length ? s.taskProjects : DEFAULT_TASK_PROJECTS,
          tasksSeeded: true,
        });
      },
      addTask: (partial) => {
        const id = uid();
        const task: Task = {
          id,
          title: partial?.title || "Untitled",
          notes: partial?.notes || "",
          projectId: partial?.projectId || "inbox",
          priority: partial?.priority ?? 4,
          dueDate: partial?.dueDate ?? todayKey(),
          reminder: partial?.reminder || "",
          repeat: partial?.repeat || "none",
          completedAt: null,
          createdAt: new Date().toISOString(),
          carriedFrom: partial?.carriedFrom,
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return id;
      },
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, id: t.id } : t)),
        })),
      toggleTask: (id) =>
        set((s) => {
          const current = s.tasks.find((t) => t.id === id);
          if (!current) return s;
          if (current.completedAt) {
            return {
              tasks: s.tasks.map((t) =>
                t.id === id ? { ...t, completedAt: null } : t,
              ),
            };
          }
          const completedAt = new Date().toISOString();
          const nextDue = nextOccurrence(current.dueDate || todayKey(), current.repeat);
          const rest = s.tasks.map((t) =>
            t.id === id ? { ...t, completedAt } : t,
          );
          if (!nextDue) return { tasks: rest };
          const follow: Task = {
            ...current,
            id: uid(),
            dueDate: nextDue,
            completedAt: null,
            createdAt: new Date().toISOString(),
            carriedFrom: undefined,
          };
          return { tasks: [follow, ...rest] };
        }),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      addTaskProject: (name) => {
        const id = uid();
        set((s) => ({
          taskProjects: [...s.taskProjects, { id, name }],
        }));
        return id;
      },
      carryForwardTasks: () =>
        set((s) => ({ tasks: applyCarryForward(s.tasks) })),
    }),
    {
      name: "spire-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        const persistable = {} as PersistShape;
        const empty = emptyPersist();
        (Object.keys(empty) as (keyof PersistShape)[]).forEach((k) => {
          persistable[k] = s[k] as never;
        });
        return persistable;
      },
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<PersistShape>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_SETTINGS, ...p.settings },
          checkIns: p.checkIns ?? [],
          habits: p.habits ?? [],
          journal: p.journal ?? [],
          mits: p.mits ?? [],
          plans: p.plans?.length ? p.plans : emptyPlans(),
          reviews: p.reviews ?? [],
          skill: p.skill ?? null,
          unlearn: p.unlearn ?? null,
          agency: { ...structuredClone(DEFAULT_AGENCY), ...p.agency },
          brain: p.brain ?? [],
          checkups: { hearing: "", vision: "", clinician: "", ...p.checkups },
          sleepLog: p.sleepLog ?? [],
          hardStairs: p.hardStairs ?? {},
          alerts: p.alerts ?? [],
          firedKeys: p.firedKeys ?? [],
          drillBest: p.drillBest ?? { speed: 0, reason: 0 },
          routines: p.routines ?? [],
          completions: p.completions ?? [],
          checks: p.checks ?? {},
          routinesSeeded: p.routinesSeeded ?? false,
          tasks: p.tasks ?? [],
          taskProjects: p.taskProjects?.length ? p.taskProjects : DEFAULT_TASK_PROJECTS,
          tasksSeeded: p.tasksSeeded ?? false,
        };
      },
    },
  ),
);

export function lastCheckIn(state: { checkIns: CheckIn[] }): CheckIn | null {
  return state.checkIns[0] ?? null;
}

export function todaysMits(state: { mits: Mit[] }, day = todayKey()) {
  return state.mits.filter((m) => m.due === day);
}

export function dueHabits(state: { habits: Habit[] }, day = todayKey()) {
  const dow = weekday(day);
  return state.habits.filter((h) => h.daysOfWeek.includes(dow));
}

export function lastNightSleep(state: { sleepLog: { date: string; hours: number }[] }) {
  const y = addDays(todayKey(), -1);
  return (
    state.sleepLog.find((s) => s.date === todayKey()) ??
    state.sleepLog.find((s) => s.date === y)
  );
}

export function weekCheckIns(state: { checkIns: CheckIn[] }) {
  const start = weekStart();
  return state.checkIns.filter((c) => c.date >= start);
}

export function lowestFrom(state: { checkIns: CheckIn[] }): Pillar {
  const c = lastCheckIn(state);
  if (!c) return "physical";
  let min: Pillar = "spiritual";
  let v = 99;
  PILLARS.forEach((p) => {
    if (c.scores[p] < v) {
      v = c.scores[p];
      min = p;
    }
  });
  return min;
}
