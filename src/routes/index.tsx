import { IconBadge } from "@/components/emoji-picker";
import { Plant, SunMark } from "@/components/plant";
import { Button, Card } from "@/components/ui";
import { useNow } from "@/hooks/use-now";
import { checksFor, useAppStore } from "@/lib/store";
import {
  currentStreak,
  dayCount,
  endTime,
  isScheduledToday,
  plantStage,
  totalSec,
} from "@/lib/stats";
import { formatDuration, formatTime, greeting, todayKey } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Play, Plus } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const now = useNow(30_000);
  const routines = useAppStore((s) => s.routines);
  const completions = useAppStore((s) => s.completions);
  const checks = useAppStore((s) => s.checks);
  const reminders = useAppStore((s) => s.reminders);
  const d = new Date(now);
  const date = todayKey(d);
  const todayRoutines = routines
    .filter((r) => isScheduledToday(r, d))
    .sort((a, b) => {
      if (a.anytime !== b.anytime) return a.anytime ? 1 : -1;
      return a.startTime.localeCompare(b.startTime);
    });
  const doneIds = new Set(
    completions.filter((c) => c.date === date && c.completedSteps > 0).map((c) => c.routineId),
  );
  const streak = currentStreak(completions);
  const plant = plantStage(streak);
  const dPlus = dayCount(completions);
  const doneCount = todayRoutines.filter((r) => doneIds.has(r.id)).length;
  const upcoming = reminders
    .filter((r) => r.enabled && r.days.includes(d.getDay()))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <main className="px-5 pt-6 pb-8">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{greeting(d)}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {d.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h1>
        </div>
        <Link to="/stats" className="shrink-0">
          <Card className="flex items-center gap-2 px-3 py-2">
            <Plant level={plant.level} size={36} />
            <div className="pr-1">
              <div className="text-xs text-muted">Streak</div>
              <div className="text-sm font-semibold tabular-nums">{streak}d</div>
            </div>
          </Card>
        </Link>
      </header>

      <Card className="mb-6 flex overflow-hidden">
        <div className="flex flex-1 items-center gap-3 p-4">
          <Plant level={plant.level} size={56} />
          <div>
            <div className="text-xs font-medium text-muted">D+{dPlus || 0}</div>
            <div className="text-lg font-semibold">{plant.name}</div>
            <p className="text-sm text-muted">
              {doneCount}/{todayRoutines.length || 0} routines today
            </p>
          </div>
        </div>
        <div className="relative w-28 overflow-hidden bg-sun">
          <div className="absolute -right-4 -bottom-6">
            <SunMark size={110} />
          </div>
        </div>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
          Today
        </h2>
        <NewRoutineButton />
      </div>

      {todayRoutines.length === 0 ? (
        <Card className="px-5 py-8 text-center">
          <p className="font-medium">Nothing scheduled today</p>
          <p className="mt-1 text-sm text-muted">
            Add a routine, or grab one from Explore.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link to="/explore">
              <Button size="sm" variant="sun">
                Explore
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {todayRoutines.map((r) => {
            const done = doneIds.has(r.id);
            const checked = checksFor(checks, r.id, date);
            const progress =
              r.steps.length === 0 ? 0 : checked.length / r.steps.length;
            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-start gap-3">
                  <IconBadge emoji={r.emoji} seed={r.id} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/routine/$id"
                      params={{ id: r.id }}
                      className="block font-semibold tracking-tight"
                    >
                      {r.name}
                    </Link>
                    <p className="text-sm text-muted">
                      {r.anytime
                        ? "Anytime"
                        : `${formatTime(r.startTime)} – ${formatTime(endTime(r))}`}
                      {" · "}
                      {r.steps.length} steps · {formatDuration(totalSec(r))}
                    </p>
                    {r.showIcons ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.steps.slice(0, 8).map((s) => (
                          <span key={s.id} className="text-base leading-none">
                            {s.emoji}
                          </span>
                        ))}
                        {r.steps.length > 8 ? (
                          <span className="text-xs text-muted">+{r.steps.length - 8}</span>
                        ) : null}
                      </div>
                    ) : null}
                    {r.showProgress ? (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sunken">
                        <div
                          className="h-full rounded-full bg-sun"
                          style={{ width: `${Math.round((done ? 1 : progress) * 100)}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <StartButton id={r.id} done={done} name={r.name} />
                </div>
                {done ? (
                  <p className="mt-2 text-xs font-medium text-mint">Finished today</p>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      {upcoming.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
            Reminders
          </h2>
          <Card className="divide-y divide-border">
            {upcoming.map((r) => (
              <Link
                key={r.id}
                to="/reminders"
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="text-lg">{r.emoji}</span>
                <span className="flex-1 text-sm font-medium">{r.title}</span>
                <span className="text-sm tabular-nums text-muted">
                  {formatTime(r.time)}
                </span>
              </Link>
            ))}
          </Card>
        </section>
      ) : null}

      <div className="mt-6 flex justify-center">
        <Link to="/explore">
          <Button variant="outline" size="md">
            <Plus className="size-4" />
            Browse routines
          </Button>
        </Link>
      </div>
    </main>
  );
}

function NewRoutineButton() {
  const navigate = useNavigate();
  const addBlank = useAppStore((s) => s.addBlankRoutine);
  return (
    <button
      type="button"
      className="text-sm font-medium"
      onClick={() => {
        const id = addBlank();
        void navigate({ to: "/routine/$id", params: { id } });
      }}
    >
      New
    </button>
  );
}

function StartButton({
  id,
  done,
  name,
}: {
  id: string;
  done: boolean;
  name: string;
}) {
  const startRun = useAppStore((s) => s.startRun);
  const navigate = useNavigate();
  return (
    <Button
      size="icon"
      variant={done ? "soft" : "solid"}
      aria-label={`Start ${name}`}
      onClick={() => {
        startRun(id);
        void navigate({ to: "/run/$id", params: { id } });
      }}
    >
      <Play className="size-4 fill-current" />
    </Button>
  );
}

