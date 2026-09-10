import { TimerRing } from "@/components/timer-ring";
import { Button, Card, Field, Switch } from "@/components/ui";
import { useNow } from "@/hooks/use-now";
import { NOISE_LABELS, startNoise, stopNoise } from "@/lib/audio";
import { remainingMs, useAppStore } from "@/lib/store";
import { formatClock, formatDuration } from "@/lib/utils";
import type { NoiseId, RingColor } from "@/lib/types";
import { RING_HEX } from "@/lib/types";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, Pause, Play, SkipForward, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/run/$id")({ component: RunPage });

const RINGS: RingColor[] = ["sun", "mint", "sky", "coral", "ink"];

function RunPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const now = useNow(200);
  const routine = useAppStore((s) => s.routines.find((r) => r.id === id));
  const session = useAppStore((s) => s.session);
  const settings = useAppStore((s) => s.settings);
  const startRun = useAppStore((s) => s.startRun);
  const pauseRun = useAppStore((s) => s.pauseRun);
  const resumeRun = useAppStore((s) => s.resumeRun);
  const completeStep = useAppStore((s) => s.completeStep);
  const skipStep = useAppStore((s) => s.skipStep);
  const adjustTime = useAppStore((s) => s.adjustTime);
  const abortRun = useAppStore((s) => s.abortRun);
  const update = useAppStore((s) => s.updateSettings);
  const [customize, setCustomize] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const startedFor = useRef<string | null>(null);
  const autoFired = useRef<number | null>(null);

  useEffect(() => {
    if (!routine) return;
    if (session?.routineId === id) return;
    if (startedFor.current === id) return;
    startedFor.current = id;
    startRun(id);
  }, [id, routine, session, startRun]);

  useEffect(() => {
    if (session?.status === "running" && settings.whiteNoise !== "off") {
      startNoise(settings.whiteNoise, settings.whiteNoiseVolume);
    } else {
      stopNoise();
    }
    return () => stopNoise();
  }, [session?.status, settings.whiteNoise, settings.whiteNoiseVolume]);

  useEffect(() => {
    if (session?.status !== "running") return;
    let lock: WakeLockSentinel | undefined;
    void navigator.wakeLock
      ?.request("screen")
      .then((l) => {
        lock = l;
      })
      .catch(() => undefined);
    return () => {
      void lock?.release();
    };
  }, [session?.status]);

  const remain = session ? remainingMs(session, now) : 0;

  useEffect(() => {
    if (!session || session.status !== "running") return;
    if (remain > 200) {
      autoFired.current = null;
      return;
    }
    if (autoFired.current === session.stepIndex) return;
    autoFired.current = session.stepIndex;
    if (settings.autoNext) completeStep();
    else {
      const current = useAppStore.getState().session;
      if (current && current.status === "running") {
        useAppStore.setState({ session: { ...current, status: "overtime" } });
      }
    }
  }, [remain, session, settings.autoNext, completeStep]);

  if (!routine) {
    return (
      <main className="p-8 text-center">
        <p>Routine missing.</p>
        <Link to="/" className="text-sm underline">
          Home
        </Link>
      </main>
    );
  }

  if (!session || session.routineId !== id) {
    return <div className="p-8 text-sm text-muted">Starting…</div>;
  }

  if (session.status === "done") {
    return (
      <DoneReport
        onHome={() => {
          abortRun();
          void navigate({ to: "/" });
        }}
      />
    );
  }

  const step = routine.steps[session.stepIndex];
  const next = routine.steps[session.stepIndex + 1];
  const planned = session.stepDurationMs;
  const progress = 1 - remain / planned;
  const overtime = remain < 0;
  const paused = session.status === "paused";

  return (
    <main className="flex min-h-dvh flex-col px-5 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Close"
          className="flex size-11 items-center justify-center rounded-full bg-sunken"
          onClick={() => {
            abortRun();
            void navigate({ to: "/routine/$id", params: { id } });
          }}
        >
          <X className="size-5" />
        </button>
        <button
          type="button"
          className="text-sm font-medium text-muted"
          onClick={() => setCustomize(true)}
        >
          Customize
        </button>
      </div>

      <div className="mt-6 text-center">
        <div className="text-sm text-muted">
          {session.stepIndex + 1} / {routine.steps.length} · {routine.name}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{step?.title}</h1>
        {step?.note ? <p className="mt-1 text-sm text-muted">{step.note}</p> : null}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <button type="button" onClick={() => setAdjustOpen(true)}>
          <TimerRing progress={progress} color={settings.ringColor} size={268}>
            <span className="text-4xl">{step?.emoji}</span>
            <span
              className={`mt-2 text-5xl font-semibold tabular-nums tracking-tight ${
                overtime ? "text-coral" : ""
              }`}
            >
              {formatClock(Math.round(remain / 1000))}
            </span>
            <span className="mt-1 text-sm text-muted">
              {overtime ? "overtime" : formatDuration(Math.round(session.stepDurationMs / 1000))}
            </span>
          </TimerRing>
        </button>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          aria-label={paused ? "Resume" : "Pause"}
          className="flex size-14 items-center justify-center rounded-full bg-sunken"
          onClick={() => (paused || session.status === "overtime" ? resumeRun() : pauseRun())}
        >
          {paused ? <Play className="size-6 fill-current" /> : <Pause className="size-6" />}
        </button>
        <button
          type="button"
          aria-label="Complete step"
          className="flex size-[4.5rem] items-center justify-center rounded-full bg-fg text-bg"
          onClick={() => completeStep()}
        >
          <Check className="size-8" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          aria-label="Skip"
          className="flex size-14 items-center justify-center rounded-full bg-sunken"
          onClick={() => skipStep()}
        >
          <SkipForward className="size-6" />
        </button>
      </div>

      {settings.timerShowNext ? (
        <p className="mt-5 text-center text-sm text-muted">
          {next ? `Up next: ${next.title}` : "Last step"}
        </p>
      ) : (
        <div className="mt-5" />
      )}

      {settings.timerShowAdjust ? (
        <div className="mt-4 flex justify-center gap-2">
          {[-60000, -10000, 10000, 60000].map((ms) => (
            <Button
              key={ms}
              size="sm"
              variant="soft"
              onClick={() => adjustTime(ms)}
            >
              {ms > 0 ? "+" : "−"}
              {Math.abs(ms) === 60000 ? "1m" : "10s"}
            </Button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="mt-5 flex items-center justify-center gap-1 text-sm text-muted"
        onClick={() => setListOpen((v) => !v)}
      >
        Remaining {routine.steps.length - session.stepIndex - 1} steps
        <ChevronDown className="size-4" />
      </button>
      {listOpen ? (
        <Card className="mt-2 divide-y divide-border">
          {routine.steps.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 px-4 py-2 text-sm ${
                i < session.stepIndex ? "text-faint line-through" : ""
              } ${i === session.stepIndex ? "font-semibold" : ""}`}
            >
              <span>{s.emoji}</span>
              <span className="flex-1">{s.title}</span>
              <span className="tabular-nums text-muted">
                {formatDuration(s.durationSec)}
              </span>
            </div>
          ))}
        </Card>
      ) : null}

      {adjustOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-fg/40">
          <div className="w-full max-w-lg rounded-t-3xl bg-bg p-5">
            <h2 className="mb-3 font-semibold">Adjust time</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                [-600000, "−10m"],
                [-60000, "−1m"],
                [60000, "+1m"],
                [600000, "+10m"],
              ].map(([ms, label]) => (
                <Button
                  key={String(ms)}
                  variant="soft"
                  onClick={() => {
                    adjustTime(Number(ms));
                    setAdjustOpen(false);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            <Button className="mt-4 w-full" variant="ghost" onClick={() => setAdjustOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}

      {customize ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-fg/40">
          <div className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-bg p-5">
            <h2 className="mb-1 text-lg font-semibold">Timer look</h2>
            <p className="mb-4 text-sm text-muted">Changes apply instantly.</p>
            <div className="mb-4">
              <div className="mb-2 text-sm font-medium">Ring</div>
              <div className="flex gap-2">
                {RINGS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update({ ringColor: c })}
                    className="size-9 rounded-full border-2"
                    style={{
                      background: RING_HEX[c],
                      borderColor: settings.ringColor === c ? "var(--color-fg)" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
            <Field label="Auto-next">
              <Switch
                checked={settings.autoNext}
                onCheckedChange={(v) => update({ autoNext: v })}
              />
            </Field>
            <Field label="Voice">
              <Switch
                checked={settings.voiceEnabled}
                onCheckedChange={(v) => update({ voiceEnabled: v })}
              />
            </Field>
            <Field label="Show next">
              <Switch
                checked={settings.timerShowNext}
                onCheckedChange={(v) => update({ timerShowNext: v })}
              />
            </Field>
            <Field label="Time adjust">
              <Switch
                checked={settings.timerShowAdjust}
                onCheckedChange={(v) => update({ timerShowAdjust: v })}
              />
            </Field>
            <Field label="White noise">
              <select
                className="h-10 rounded-xl border border-border bg-surface px-2 text-sm"
                value={settings.whiteNoise}
                onChange={(e) => update({ whiteNoise: e.target.value as NoiseId })}
              >
                {Object.entries(NOISE_LABELS).map(([nid, name]) => (
                  <option key={nid} value={nid}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
            <Button className="mt-4 w-full" onClick={() => setCustomize(false)}>
              Done
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function DoneReport({ onHome }: { onHome: () => void }) {
  const session = useAppStore((s) => s.session);
  const routine = useAppStore((s) =>
    s.routines.find((r) => r.id === session?.routineId),
  );
  const completions = useAppStore((s) => s.completions);
  const last = completions[0];
  const rows = useMemo(() => {
    if (!routine || !session) return [];
    return routine.steps.map((s, i) => {
      const actual = session.stepActualMs[i] ?? 0;
      const planned = s.durationSec * 1000;
      const skipped = session.skipped.includes(i);
      return { s, actual, planned, skipped };
    });
  }, [routine, session]);

  if (!routine || !last) return null;

  return (
    <main className="px-5 pt-10 pb-8">
      <p className="text-sm text-mint">Great job today</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{routine.name}</h1>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Card className="p-4">
          <div className="text-xs text-muted">Total</div>
          <div className="text-xl font-semibold tabular-nums">
            {formatDuration(last.durationSec)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted">Finished</div>
          <div className="text-xl font-semibold tabular-nums">
            {last.completedSteps}/{last.totalSteps}
          </div>
        </Card>
      </div>
      <div className="mt-5 space-y-2">
        {rows.map(({ s, actual, planned, skipped }) => {
          const delta = Math.round((actual - planned) / 1000);
          return (
            <Card key={s.id} className="flex items-center gap-3 p-3">
              <span>{s.emoji}</span>
              <span className="flex-1 text-sm font-medium">{s.title}</span>
              <span className="text-xs tabular-nums text-muted">
                {skipped
                  ? "Skipped"
                  : `${formatDuration(Math.round(actual / 1000))}${
                      delta === 0
                        ? ""
                        : delta > 0
                          ? ` +${formatDuration(delta)}`
                          : ` ${formatDuration(delta)}`
                    }`}
              </span>
            </Card>
          );
        })}
      </div>
      <Button className="mt-6 w-full" size="pill" onClick={onHome}>
        Back to today
      </Button>
    </main>
  );
}
