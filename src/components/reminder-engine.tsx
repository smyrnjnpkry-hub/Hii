import { isScheduledToday } from "@/lib/routines";
import { useStore } from "@/lib/store";
import { todayKey, weekday } from "@/lib/utils";
import { useEffect } from "react";

export function ReminderEngine() {
  const settings = useStore((s) => s.settings);
  const habits = useStore((s) => s.habits);
  const mits = useStore((s) => s.mits);
  const tasks = useStore((s) => s.tasks);
  const routines = useStore((s) => s.routines);
  const firedKeys = useStore((s) => s.firedKeys);
  const markFired = useStore((s) => s.markFired);
  const pushAlert = useStore((s) => s.pushAlert);
  const onboarded = settings.onboarded;

  useEffect(() => {
    if (!onboarded) return;
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const clock = `${hh}:${mm}`;
      const day = todayKey();
      const dailyKey = `daily:${day}`;
      if (clock === settings.reminderTime && !firedKeys.includes(dailyKey)) {
        markFired(dailyKey);
        pushAlert("A quiet look", "How are the five colors today? A check-in is enough.");
      }
      const dow = weekday(day);
      habits.forEach((h) => {
        if (!h.reminder || !h.daysOfWeek.includes(dow)) return;
        const key = `habit:${h.id}:${day}`;
        if (h.reminder !== clock || firedKeys.includes(key)) return;
        if (h.completions.some((c) => c.date === day)) return;
        markFired(key);
        pushAlert("Cue window", `After ${h.cueRoutine}: ${h.tinyAct}`);
      });
      mits
        .filter((m) => m.status === "open" && m.due === day)
        .forEach((m) => {
          const key = `mit:${m.id}:${day}:afternoon`;
          if (clock === "15:00" && !firedKeys.includes(key) && m.starts.length === 0) {
            markFired(key);
            pushAlert("Still open", `${m.title} — start the ugly first minute.`);
          }
        });
      tasks
        .filter((t) => !t.completedAt && t.reminder && (t.dueDate === day || !t.dueDate))
        .forEach((t) => {
          const key = `task:${t.id}:${day}`;
          if (t.reminder !== clock || firedKeys.includes(key)) return;
          markFired(key);
          pushAlert("Task reminder", t.title);
        });
      routines.filter((r) => isScheduledToday(r, now) && !r.anytime).forEach((r) => {
        const key = `routine:${r.id}:${day}`;
        if (r.startTime !== clock || firedKeys.includes(key)) return;
        markFired(key);
        pushAlert("Routine window", `${r.name} — press play.`);
      });
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, [onboarded, settings.reminderTime, habits, mits, tasks, routines, firedKeys, markFired, pushAlert]);

  return null;
}