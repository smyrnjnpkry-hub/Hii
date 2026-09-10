import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { playSound } from "@/lib/audio";
import { seedReminders, seedRoutines, templateToRoutine, blankRoutine } from "@/lib/seed";
import { speak } from "@/lib/tts";
import type {
  Completion,
  InAppAlert,
  Routine,
  RoutineReminder,
  RunSession,
  Settings,
  StandaloneReminder,
  Step,
  Template,
} from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { todayKey, uid } from "@/lib/utils";

export type Checks = Record<string, string[]>;

type PersistShape = {
  routines: Routine[];
  reminders: StandaloneReminder[];
  completions: Completion[];
  checks: Checks;
  settings: Settings;
  session: RunSession | null;
  alerts: InAppAlert[];
  firedKeys: string[];
  hasSeeded: boolean;
};

type AppState = PersistShape & {
  hydrated: boolean;
  setHydrated: () => void;
  seedIfNeeded: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addFromTemplate: (t: Template) => string;
  addBlankRoutine: () => string;
  saveRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutine: (id: string) => void;
  saveStep: (routineId: string, step: Step) => void;
  addStep: (routineId: string, step?: Partial<Step>) => void;
  deleteStep: (routineId: string, stepId: string) => void;
  moveStep: (routineId: string, from: number, to: number) => void;
  saveReminder: (r: StandaloneReminder) => void;
  addReminder: () => string;
  deleteReminder: (id: string) => void;
  toggleCheck: (routineId: string, stepId: string, date?: string) => void;
  startRun: (routineId: string) => void;
  pauseRun: () => void;
  resumeRun: () => void;
  adjustTime: (deltaMs: number) => void;
  completeStep: () => void;
  skipStep: () => void;
  abortRun: () => void;
  dismissAlert: (id: string) => void;
  pushAlert: (alert: Omit<InAppAlert, "id" | "createdAt">) => void;
  markFired: (key: string) => void;
};

function checkKey(date: string, routineId: string) {
  return `${date}:${routineId}`;
}

function cueStep(settings: Settings, step: Step, isLast: boolean) {
  if (settings.soundEnabled) playSound(settings.stepSound, settings.volume);
  if (settings.voiceEnabled) {
    const mins = Math.max(1, Math.round(step.durationSec / 60));
    const time =
      step.durationSec < 60
        ? `${step.durationSec} seconds`
        : mins === 1
          ? "one minute"
          : `${mins} minutes`;
    speak(`${step.title}. ${time}${isLast ? ". Last step." : "."}`, settings.volume);
  }
}

function remainingMs(session: RunSession, now = Date.now()) {
  const elapsed =
    session.status === "paused"
      ? session.elapsedBeforePause
      : session.elapsedBeforePause + (now - session.segmentStartedAt);
  return session.stepDurationMs - elapsed;
}

export { remainingMs };

function finishFrom(session: RunSession, routine: Routine, extra: Partial<RunSession> = {}): Completion {
  const now = Date.now();
  const merged: RunSession = { ...session, ...extra };
  return {
    id: uid(),
    routineId: routine.id,
    date: todayKey(),
    startedAt: merged.sessionStartedAt,
    finishedAt: now,
    completedSteps: merged.completed.length,
    totalSteps: routine.steps.length,
    skippedSteps: merged.skipped.length,
    durationSec: Math.round((now - merged.sessionStartedAt) / 1000),
    stepActualMs: merged.stepActualMs,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      routines: [],
      reminders: [],
      completions: [],
      checks: {},
      settings: DEFAULT_SETTINGS,
      session: null,
      alerts: [],
      firedKeys: [],
      hasSeeded: false,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      seedIfNeeded: () => {
        if (get().hasSeeded) return;
        set({
          routines: seedRoutines(),
          reminders: seedReminders(),
          hasSeeded: true,
        });
      },

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

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

      saveReminder: (r) =>
        set((s) => {
          const exists = s.reminders.some((x) => x.id === r.id);
          return {
            reminders: exists
              ? s.reminders.map((x) => (x.id === r.id ? r : x))
              : [r, ...s.reminders],
          };
        }),

      addReminder: () => {
        const r: StandaloneReminder = {
          id: uid(),
          title: "New reminder",
          emoji: "⏰",
          time: "09:00",
          days: [1, 2, 3, 4, 5],
          enabled: true,
          sound: get().settings.reminderSound,
          note: "",
        };
        set((s) => ({ reminders: [r, ...s.reminders] }));
        return r.id;
      },

      deleteReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

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
                  stepActualMs: routine.steps.map((st) => st.durationSec * 1000),
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
        const session: RunSession = {
          routineId,
          stepIndex: 0,
          status: "running",
          stepDurationMs: first.durationSec * 1000,
          segmentStartedAt: Date.now(),
          elapsedBeforePause: 0,
          skipped: [],
          completed: [],
          sessionStartedAt: Date.now(),
          spoken: { "0": true },
          stepActualMs: [],
        };
        set({ session });
        cueStep(get().settings, first, routine.steps.length === 1);
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
        const { session, routines, settings } = get();
        if (!session) return;
        const routine = routines.find((r) => r.id === session.routineId);
        if (!routine) return;
        const now = Date.now();
        const used = session.stepDurationMs - remainingMs(session, now);
        const actual = [...session.stepActualMs];
        actual[session.stepIndex] = Math.max(0, used);
        const completed = session.completed.includes(session.stepIndex)
          ? session.completed
          : [...session.completed, session.stepIndex];

        const nextIndex = session.stepIndex + 1;
        if (nextIndex >= routine.steps.length) {
          const doneSession: RunSession = {
            ...session,
            status: "done",
            completed,
            stepActualMs: actual,
          };
          const completion = finishFrom(doneSession, routine);
          set((s) => ({
            session: doneSession,
            completions: [completion, ...s.completions],
          }));
          if (settings.soundEnabled) playSound(settings.completeSound, settings.volume);
          if (settings.voiceEnabled) speak("Routine complete. Nice work.", settings.volume);
          return;
        }

        const next = routine.steps[nextIndex];
        const nextSession: RunSession = {
          ...session,
          stepIndex: nextIndex,
          status: "running",
          stepDurationMs: next.durationSec * 1000,
          segmentStartedAt: now,
          elapsedBeforePause: 0,
          completed,
          stepActualMs: actual,
          spoken: { ...session.spoken, [String(nextIndex)]: true },
        };
        set({ session: nextSession });
        cueStep(settings, next, nextIndex === routine.steps.length - 1);
      },

      skipStep: () => {
        const { session, routines, settings } = get();
        if (!session) return;
        const routine = routines.find((r) => r.id === session.routineId);
        if (!routine) return;
        const now = Date.now();
        const used = session.stepDurationMs - remainingMs(session, now);
        const actual = [...session.stepActualMs];
        actual[session.stepIndex] = Math.max(0, used);
        const skipped = session.skipped.includes(session.stepIndex)
          ? session.skipped
          : [...session.skipped, session.stepIndex];
        const nextIndex = session.stepIndex + 1;
        if (nextIndex >= routine.steps.length) {
          const doneSession: RunSession = {
            ...session,
            status: "done",
            skipped,
            stepActualMs: actual,
          };
          const completion = finishFrom(doneSession, routine);
          set((s) => ({
            session: doneSession,
            completions: [completion, ...s.completions],
          }));
          if (settings.soundEnabled) playSound(settings.completeSound, settings.volume);
          if (settings.voiceEnabled) speak("Routine complete.", settings.volume);
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
            stepActualMs: actual,
            spoken: { ...session.spoken, [String(nextIndex)]: true },
          },
        });
        cueStep(settings, next, nextIndex === routine.steps.length - 1);
      },

      abortRun: () => set({ session: null }),

      dismissAlert: (id) =>
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

      pushAlert: (alert) =>
        set((s) => ({
          alerts: [
            { ...alert, id: uid(), createdAt: Date.now() },
            ...s.alerts,
          ].slice(0, 12),
        })),

      markFired: (key) =>
        set((s) => {
          const today = todayKey();
          const kept = s.firedKeys.filter((k) => k.startsWith(today) || k.includes(today));
          return { firedKeys: [...kept, key].slice(-200) };
        }),
    }),
    {
      name: "dayring-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        routines: s.routines,
        reminders: s.reminders,
        completions: s.completions,
        checks: s.checks,
        settings: s.settings,
        session: s.session,
        alerts: s.alerts,
        firedKeys: s.firedKeys,
        hasSeeded: s.hasSeeded,
      }),
    },
  ),
);

export function checksFor(checks: Checks, routineId: string, date = todayKey()) {
  return checks[checkKey(date, routineId)] ?? [];
}

export function hydrateStore() {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    const s = useAppStore.getState();
    if (!s.hasSeeded) s.seedIfNeeded();
    s.setHydrated();
  };
  void Promise.resolve(useAppStore.persist.rehydrate()).then(finish, finish);
  if (useAppStore.persist.hasHydrated()) finish();
}

export function formatCue(step: Step) {
  return `${step.emoji} ${step.title}`;
}

export type { RoutineReminder };
