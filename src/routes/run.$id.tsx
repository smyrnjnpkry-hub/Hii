import { Button } from "@/components/ui";
import { useNow } from "@/hooks/use-now";
import { remainingMs } from "@/lib/routines";
import { useStore } from "@/lib/store";
import { cn, formatClock, formatDuration } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Pause, Play, SkipForward, X } from "lucide-react";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/run/$id")({ component: RunPage });

function RunPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const now = useNow(200);
  const routine = useStore((s) => s.routines.find((r) => r.id === id));
  const session = useStore((s) => s.session);
  const startRun = useStore((s) => s.startRun);
  const pauseRun = useStore((s) => s.pauseRun);
  const resumeRun = useStore((s) => s.resumeRun);
  const completeStep = useStore((s) => s.completeStep);
  const skipStep = useStore((s) => s.skipStep);
  const abortRun = useStore((s) => s.abortRun);
  const startedFor = useRef<string | null>(null);
  const autoFired = useRef<number | null>(null);

  useEffect(() => {
    if (!routine) return;
    if (session?.routineId === id) return;
    if (startedFor.current === id) return;
    startedFor.current = id;
    startRun(id);
  }, [id, routine, session, startRun]);

  const remain = session ? remainingMs(session, now) : 0;

  useEffect(() => {
    if (!session || session.status !== "running") return;
    if (remain > 200) {
      autoFired.current = null;
      return;
    }
    if (autoFired.current === session.stepIndex) return;
    autoFired.current = session.stepIndex;
    completeStep();
  }, [remain, session, completeStep]);

  if (!routine) {
    return (
      <main className="p-8 text-center">
        <p>Routine missing.</p>
        <Link to="/routines" className="text-sm underline">
          Back
        </Link>
      </main>
    );
  }

  if (!session || session.routineId !== id) {
    return <div className="p-8 text-sm text-muted">Starting…</div>;
  }

  if (session.status === "done") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 pb-24 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Complete</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{routine.name}</h1>
        <p className="mt-2 text-sm text-muted">
          {session.completed.length} steps done
          {session.skipped.length ? ` · ${session.skipped.length} skipped` : ""}
        </p>
        <Button
          className="mt-8"
          onClick={() => {
            abortRun();
            void navigate({ to: "/routines" });
          }}
        >
          <Check className="size-4" />
          Back to routines
        </Button>
      </main>
    );
  }

  const step = routine.steps[session.stepIndex];
  const next = routine.steps[session.stepIndex + 1];
  const planned = session.stepDurationMs;
  const progress = Math.min(1, Math.max(0, 1 - remain / planned));
  const overtime = remain < 0;
  const paused = session.status === "paused";
  const r = 112;
  const c = 2 * Math.PI * r;

  return (
    <main className="flex min-h-dvh flex-col px-5 pt-4 pb-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Close"
          className="grid size-11 place-items-center rounded-full bg-sunken"
          onClick={() => {
            abortRun();
            void navigate({ to: "/routine/$id", params: { id } });
          }}
        >
          <X className="size-5" />
        </button>
        <p className="text-sm text-muted">
          {session.stepIndex + 1} / {routine.steps.length}
        </p>
        <span className="size-11" />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted">{routine.name}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{step?.title}</h1>
        {step?.note ? <p className="mt-2 text-sm text-muted">{step.note}</p> : null}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative size-64">
          <svg viewBox="0 0 256 256" className="size-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-sunken"
            />
            <circle
              cx="128"
              cy="128"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - progress)}
              strokeLinecap="round"
              className={overtime ? "text-danger" : "text-primary"}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl">{step?.emoji}</span>
            <span
              className={cn(
                "mt-1 font-display text-5xl font-semibold tabular-nums tracking-tight",
                overtime && "text-danger",
              )}
            >
              {formatClock(Math.round(remain / 1000))}
            </span>
            <span className="mt-1 text-sm text-muted">
              {overtime ? "overtime" : formatDuration(Math.round(session.stepDurationMs / 1000))}
            </span>
          </div>
        </div>
        {next ? (
          <p className="mt-6 text-sm text-muted">Next · {next.title}</p>
        ) : (
          <p className="mt-6 text-sm text-muted">Last step</p>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" onClick={skipStep}>
          <SkipForward className="size-4" />
          Skip
        </Button>
        {paused ? (
          <Button size="lg" onClick={resumeRun}>
            <Play className="size-5 fill-current" />
            Resume
          </Button>
        ) : (
          <Button size="lg" variant="outline" onClick={pauseRun}>
            <Pause className="size-5" />
            Pause
          </Button>
        )}
        <Button onClick={completeStep}>
          <Check className="size-4" />
          Done
        </Button>
      </div>
    </main>
  );
}
