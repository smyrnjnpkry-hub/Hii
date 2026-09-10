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
  routinePriorityScore,
  totalSec,
} from "@/lib/stats";
import { cn, formatDuration, formatTime, greeting, todayKey } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Play, Plus, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const now = useNow(30_000);
  const routines = useAppStore((s) => s.routines);
  const completions = useAppStore((s) => s.completions);
  const checks = useAppStore((s) => s.checks);
  const reminders = useAppStore((s) => s.reminders);
  const plantName = useAppStore((s) => s.settings.plantName || "Sprout");
  const displayName = useAppStore((s) => s.settings.displayName);
  const d = new Date(now);
  const date = todayKey(d);
  const todayRoutines = routines.filter((r) => isScheduledToday(r, d));
  const doneIds = new Set(
    completions.filter((c) => c.date === date && c.completedSteps > 0).map((c) => c.routineId),
  );
  const sorted = [...todayRoutines].sort((a, b) => {
    const da = doneIds.has(a.id) ? 1 : 0;
    const db = doneIds.has(b.id) ? 1 : 0;
    if (da !== db) return da - db;
    return routinePriorityScore(a, d) - routinePriorityScore(b, d);
  });
  const nextUp = sorted.find((r) => !doneIds.has(r.id)) ?? null;
  const streak = currentStreak(completions);
  const plant = plantStage(streak);
  const dPlus = dayCount(completions);
  const doneCount = todayRoutines.filter((r) => doneIds.has(r.id)).length;
  const upcoming = reminders
    .filter((r) => r.enabled && r.days.includes(d.getDay()))
    .sort((a, b) => a.time.localeCompare(b.time));
  const greet = displayName
    ? `${greeting(d)}, ${displayName.split(" ")[0]}`
    : greeting(d);

  return (
    <main className="px-5 pt-6 pb-8">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{greet}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {d.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h1>
        </div>
        <Link to="/stats" className="shrink-0 transition-transform active:scale-[0.98]">
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
            <div className="text-xs font-medium text-muted">
              {plantName} · D+{dPlus || 0}
            </div>
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

      {nextUp ? (
        <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-wide text-muted uppercase">
            <Sparkles className="size-3.5 text-sun" aria-hidden />
            Next up
          </h2>
          <Card className="border border-sun/40 bg-sun/10 p-4 shadow-card dark:bg-sun/15">
            <div className="flex items-start gap-3">
              <IconBadge emoji={nextUp.emoji} seed={nextUp.id} />
              <div className="min-w-0 flex-1">
                <Link
                  to="/routine/$id"
                  params={{ id: nextUp.id }}
                  className="block font-semibold tracking-tight"
                >
                  {nextUp.name}
                </Link>
                <p className="text-sm text-muted">
                  {nextUp.anytime
                    ? "Anytime · ready when you are"
                    : `${formatTime(nextUp.startTime)} – ${formatTime(endTime(nextUp))}`}
                  {" · "}
                  {formatDuration(totalSec(nextUp))}
                </p>
              </div>
              <StartButton id={nextUp.id} done={false} name={nextUp.name} prominent />
            </div>
          </Card>
        </section>
      ) : null}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
          Today
        </h2>
        <NewRoutineButton />
      </div>

      {sorted.length === 0 ? (
        <Card className="px-5 py-10 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-sun/25 text-2xl">
            🌱
          </div>
          <p className="font-semibold tracking-tight">Your day is wide open</p>
          <p className="mt-1 text-sm text-muted">
            Grab a template from Explore — or invent one in a minute.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/explore">
              <Button size="md" variant="sun">
                Explore routines
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => {
            const done = doneIds.has(r.id);
            const checked = checksFor(checks, r.id, date);
            const progress =
              r.steps.length === 0 ? 0 : checked.length / r.steps.length;
            const isNext = nextUp?.id === r.id;
            return (
              <Card
                key={r.id}
                className={cn(
                  "p-4 transition-transform active:scale-[0.995]",
                  isNext && "opacity-70",
                )}
              >
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
                          className="h-full rounded-full bg-sun transition-[width] duration-300"
                          style={{ width: `${Math.round((done ? 1 : progress) * 100)}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                  {!isNext ? (
                    <StartButton id={r.id} done={done} name={r.name} />
                  ) : (
                    <span className="text-xs font-medium text-muted">Up next</span>
                  )}
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
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sunken/50"
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
      className="text-sm font-medium text-fg underline-offset-2 hover:underline"
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
  prominent = false,
}: {
  id: string;
  done: boolean;
  name: string;
  prominent?: boolean;
}) {
  const startRun = useAppStore((s) => s.startRun);
  const navigate = useNavigate();
  return (
    <Button
      size="icon"
      variant={prominent ? "sun" : done ? "soft" : "solid"}
      aria-label={`Start ${name}`}
      className={prominent ? "shadow-card ring-2 ring-sun/40 ring-offset-2 ring-offset-bg" : undefined}
      onClick={() => {
        startRun(id);
        void navigate({ to: "/run/$id", params: { id } });
      }}
    >
      <Play className="size-4 fill-current" />
    </Button>
  );
}
