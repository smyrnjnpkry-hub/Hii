import { Button, Card, Segmented } from "@/components/ui";
import { isScheduledToday, ROUTINE_TEMPLATES, totalSec } from "@/lib/routines";
import { useStore } from "@/lib/store";
import { cn, DAY_LABELS, formatDuration, formatTime, todayKey } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Play, Plus } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/routines")({ component: RoutinesPage });

type Layer = "today" | "all" | "library";

function RoutinesPage() {
  const routines = useStore((s) => s.routines);
  const completions = useStore((s) => s.completions);
  const addFromTemplate = useStore((s) => s.addFromTemplate);
  const addBlankRoutine = useStore((s) => s.addBlankRoutine);
  const startRun = useStore((s) => s.startRun);
  const navigate = useNavigate();
  const [layer, setLayer] = useState<Layer>("today");
  const today = todayKey();
  const doneIds = useMemo(
    () =>
      new Set(
        completions
          .filter((c) => c.date === today && c.completedSteps > 0)
          .map((c) => c.routineId),
      ),
    [completions, today],
  );
  const scheduled = routines.filter((r) => isScheduledToday(r));
  const list = layer === "today" ? scheduled : routines;

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Timed sequences
      </p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Routines</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const id = addBlankRoutine();
            void navigate({ to: "/routine/$id", params: { id } });
          }}
        >
          <Plus className="size-4" />
          New
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted">
        Press play and walk the steps. Old rails, still here — morning, night, just start.
      </p>

      <div className="mt-4">
        <Segmented
          value={layer}
          onChange={setLayer}
          options={[
            { value: "today", label: "Today" },
            { value: "all", label: "All" },
            { value: "library", label: "Library" },
          ]}
        />
      </div>

      {layer === "library" ? (
        <div className="mt-4 flex flex-col gap-2">
          {ROUTINE_TEMPLATES.map((t) => (
            <Card key={t.id}>
              <p className="font-medium">
                {t.emoji} {t.name}
              </p>
              <p className="mt-1 text-sm text-muted">{t.blurb}</p>
              <p className="mt-1 text-xs text-faint">
                {t.steps.length} steps · {formatDuration(t.steps.reduce((n, s) => n + s.durationSec, 0))}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => {
                  const id = addFromTemplate(t);
                  void navigate({ to: "/routine/$id", params: { id } });
                }}
              >
                Add to my routines
              </Button>
            </Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card className="mt-4">
          <p className="font-medium">No routines {layer === "today" ? "today" : "yet"}.</p>
          <p className="mt-1 text-sm text-muted">Open Library and add Morning, Night, or Just Start.</p>
        </Card>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {list.map((r) => {
            const done = doneIds.has(r.id);
            return (
              <Card key={r.id} className={cn(done && "opacity-70")}>
                <div className="flex items-start gap-3">
                  <Link to="/routine/$id" params={{ id: r.id }} className="min-w-0 flex-1">
                    <p className="font-medium">
                      {r.emoji} {r.name}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {r.steps.length} steps · {formatDuration(totalSec(r))}
                      {r.anytime ? " · anytime" : ` · ${formatTime(r.startTime)}`}
                    </p>
                    <p className="mt-1 text-xs text-faint">
                      {r.days.map((d) => DAY_LABELS[d]).join(" ")}
                    </p>
                    {done ? <p className="mt-2 text-xs text-primary">Finished today</p> : null}
                  </Link>
                  {!done ? (
                    <Button
                      size="icon"
                      aria-label={`Start ${r.name}`}
                      onClick={() => {
                        startRun(r.id);
                        void navigate({ to: "/run/$id", params: { id: r.id } });
                      }}
                    >
                      <Play className="size-4 fill-current" />
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
