import { Button, Card, Input, Modal, Switch } from "@/components/ui";
import { useStore } from "@/lib/store";
import { checkKey, totalSec } from "@/lib/routines";
import type { TimedRoutine } from "@/lib/types";
import { cn, DAY_LABELS, formatDuration, todayKey } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Play, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/routine/$id")({ component: RoutineEditor });

function RoutineEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const routines = useStore((s) => s.routines);
  const save = useStore((s) => s.saveRoutine);
  const addBlank = useStore((s) => s.addBlankRoutine);
  const del = useStore((s) => s.deleteRoutine);
  const addStep = useStore((s) => s.addStep);
  const saveStep = useStore((s) => s.saveStep);
  const deleteStep = useStore((s) => s.deleteStep);
  const moveStep = useStore((s) => s.moveStep);
  const toggleCheck = useStore((s) => s.toggleCheck);
  const startRun = useStore((s) => s.startRun);
  const checks = useStore((s) => s.checks);
  const [stepId, setStepId] = useState<string | null>(null);
  const [mode, setMode] = useState<"run" | "check">("run");

  useEffect(() => {
    if (id !== "new") return;
    const nid = addBlank();
    void navigate({ to: "/routine/$id", params: { id: nid }, replace: true });
  }, [id, addBlank, navigate]);

  const routine = routines.find((r) => r.id === id);
  const checked = routine ? (checks[checkKey(todayKey(), routine.id)] ?? []) : [];
  const editing = routine?.steps.find((s) => s.id === stepId) ?? null;

  if (id === "new") {
    return <div className="p-8 text-sm text-muted">Creating…</div>;
  }
  if (!routine) {
    return (
      <main className="px-4 py-12 text-center">
        <p className="font-medium">Routine gone</p>
        <Link to="/routines" className="mt-3 inline-block text-sm text-muted underline">
          Back to routines
        </Link>
      </main>
    );
  }

  function patch(p: Partial<TimedRoutine>) {
    save({ ...routine!, ...p });
  }

  return (
    <main className="px-4 pb-28 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/routines" className="text-sm text-muted">
          Back
        </Link>
        <button
          type="button"
          className="text-sm text-danger"
          onClick={() => {
            del(routine.id);
            void navigate({ to: "/routines" });
          }}
        >
          Delete
        </button>
      </div>

      <Input
        value={routine.name}
        onChange={(e) => patch({ name: e.target.value })}
        className="font-display text-xl font-semibold"
      />
      <div className="mt-3 flex items-center gap-3">
        <Input
          type="time"
          value={routine.startTime}
          onChange={(e) => patch({ startTime: e.target.value })}
          className="w-36"
          disabled={routine.anytime}
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <Switch checked={routine.anytime} onCheckedChange={(v) => patch({ anytime: v })} />
          Anytime
        </label>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          <Switch checked={routine.enabled} onCheckedChange={() => patch({ enabled: !routine.enabled })} />
          On
        </label>
      </div>

      <div className="mt-4 flex gap-1">
        {DAY_LABELS.map((label, i) => {
          const on = routine.days.includes(i);
          return (
            <button
              key={`${label}-${i}`}
              type="button"
              onClick={() => {
                const days = on ? routine.days.filter((d) => d !== i) : [...routine.days, i].sort();
                patch({ days });
              }}
              className={cn(
                "grid size-11 flex-1 place-items-center rounded-full text-xs font-medium",
                on ? "bg-fg text-bg" : "bg-sunken text-muted",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted">
        {routine.steps.length} steps · {formatDuration(totalSec(routine))}
      </p>

      <div className="mt-3 flex gap-2">
        <Button
          className="flex-1"
          onClick={() => {
            startRun(routine.id);
            void navigate({ to: "/run/$id", params: { id: routine.id } });
          }}
        >
          <Play className="size-4 fill-current" />
          Start
        </Button>
        <Button
          variant={mode === "check" ? "solid" : "outline"}
          onClick={() => setMode(mode === "check" ? "run" : "check")}
        >
          Checklist
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {routine.steps.map((step, i) => {
          const on = checked.includes(step.id);
          return (
            <Card key={step.id} className="flex items-center gap-3">
              {mode === "check" ? (
                <button
                  type="button"
                  aria-label={`Toggle ${step.title}`}
                  onClick={() => toggleCheck(routine.id, step.id)}
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full",
                    on ? "bg-primary text-primary-fg" : "bg-sunken text-muted",
                  )}
                >
                  {on ? "✓" : i + 1}
                </button>
              ) : (
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sunken text-sm">
                  {step.emoji}
                </span>
              )}
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => setStepId(step.id)}
              >
                <p className={cn("font-medium", on && "line-through text-muted")}>{step.title}</p>
                <p className="text-xs text-muted">{formatDuration(step.durationSec)}</p>
              </button>
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label="Move up"
                  className="grid size-9 place-items-center text-muted"
                  onClick={() => moveStep(routine.id, i, i - 1)}
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  className="grid size-9 place-items-center text-muted"
                  onClick={() => moveStep(routine.id, i, i + 1)}
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Button variant="outline" className="mt-4 w-full" onClick={() => addStep(routine.id)}>
        <Plus className="size-4" />
        Add step
      </Button>

      <Modal open={!!editing} onClose={() => setStepId(null)} title="Edit step">
        {editing ? (
          <div className="flex flex-col gap-3">
            <Input
              value={editing.title}
              onChange={(e) => saveStep(routine.id, { ...editing, title: e.target.value })}
              placeholder="Step title"
            />
            <Input
              value={editing.emoji}
              onChange={(e) => saveStep(routine.id, { ...editing, emoji: e.target.value })}
              placeholder="Mark"
            />
            <label className="text-sm text-muted">
              Minutes
              <Input
                className="mt-1"
                type="number"
                min={0.5}
                step={0.5}
                value={Math.max(0.5, editing.durationSec / 60)}
                onChange={(e) =>
                  saveStep(routine.id, {
                    ...editing,
                    durationSec: Math.max(15, Math.round(Number(e.target.value) * 60)),
                  })
                }
              />
            </label>
            <Input
              value={editing.note ?? ""}
              onChange={(e) => saveStep(routine.id, { ...editing, note: e.target.value })}
              placeholder="Optional note"
            />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setStepId(null)}>
                Done
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  deleteStep(routine.id, editing.id);
                  setStepId(null);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </main>
  );
}
