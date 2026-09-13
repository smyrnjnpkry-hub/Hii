import { Button, Card, Input, Modal, Segmented, Switch } from "@/components/ui";
import { MICRO_LIBRARY, MVI_LIBRARY, PILLAR_META } from "@/lib/pillars";
import { DOW_DEFAULT, useStore } from "@/lib/store";
import { PILLARS, type Habit, type Pillar } from "@/lib/types";
import { cn, estimateMinutes, todayKey, weekday } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/habits")({ component: HabitsPage });

type Layer = "mvi" | "pinned" | "design";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function HabitsPage() {
  const habits = useStore((s) => s.habits);
  const completeHabit = useStore((s) => s.completeHabit);
  const missHabit = useStore((s) => s.missHabit);
  const shrinkHabit = useStore((s) => s.shrinkHabit);
  const addHabit = useStore((s) => s.addHabit);
  const updateHabit = useStore((s) => s.updateHabit);
  const scoreAutomaticity = useStore((s) => s.scoreAutomaticity);
  const season = useStore((s) => s.settings.season);
  const [layer, setLayer] = useState<Layer>("pinned");
  const [editing, setEditing] = useState<Habit | null>(null);
  const [builder, setBuilder] = useState(false);
  const today = todayKey();
  const dow = weekday(today);
  const pinned = habits.filter((h) => h.kind === "habit");
  const liveCount = pinned.length;

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Reminders · repetitions · rituals
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Small is enough.</h1>
      <p className="mt-2 text-sm text-muted">
        Default three days a week, not seven. Missing a day does not reset automaticity. 18–254
        days is the real window — not 21.
      </p>

      <div className="mt-4">
        <Segmented
          value={layer}
          onChange={setLayer}
          options={[
            { value: "mvi", label: "MVI" },
            { value: "pinned", label: "Pinned" },
            { value: "design", label: "Design" },
          ]}
        />
      </div>

      {layer === "mvi" && (
        <div className="mt-4 flex flex-col gap-2">
          {(season === "hard" ? MVI_LIBRARY : [...MVI_LIBRARY, ...MICRO_LIBRARY.slice(0, 6)]).map(
            (a) => (
              <Card key={a.id}>
                <p className="text-xs" style={{ color: PILLAR_META[a.pillar].color }}>
                  {PILLAR_META[a.pillar].label} · {a.minutes} min
                </p>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-muted">{a.detail}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  disabled={liveCount >= 3}
                  onClick={() =>
                    addHabit({
                      identity: "I am someone who keeps tiny promises",
                      tinyAct: a.title,
                      fullAct: a.title,
                      pillar: a.pillar,
                      cueRoutine: "an existing pause",
                      cuePlace: "wherever I am",
                      prompt: "This card",
                      daysOfWeek: DOW_DEFAULT,
                      reminder: "",
                      ritualNote: "",
                      keystone: liveCount === 0,
                      env: { obvious: true, attractive: true, easy: true, satisfying: true },
                      kind: "habit",
                    })
                  }
                >
                  Pin with 3 Rs
                </Button>
              </Card>
            ),
          )}
        </div>
      )}

      {layer === "pinned" && (
        <div className="mt-4 flex flex-col gap-3">
          {liveCount >= 3 ? (
            <p className="text-sm text-muted">Three new habits is the cap. Depth over collection.</p>
          ) : (
            <Button variant="outline" onClick={() => setBuilder(true)}>
              New if-then habit
            </Button>
          )}
          {pinned.map((h) => {
            const done = h.completions.some((c) => c.date === today);
            const dueToday = h.daysOfWeek.includes(dow);
            const auto = h.automaticity[0]?.score;
            return (
              <Card key={h.id}>
                {h.keystone ? (
                  <p className="text-xs uppercase tracking-wide text-muted">Keystone</p>
                ) : null}
                <p className="text-xs text-muted">{h.identity}</p>
                <p className="font-medium">{h.tinyAct}</p>
                <p className="text-sm text-muted">
                  After {h.cueRoutine}, in {h.cuePlace}. Prompt: {h.prompt}.
                </p>
                <p className="mt-1 text-xs text-muted">
                  {h.daysOfWeek.map((d) => DOW[d]).join(" · ")}
                  {auto ? ` · automaticity ${auto}/7` : ""}
                </p>
                {dueToday ? (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant={done ? "primary" : "solid"}
                      className="flex-1"
                      onClick={() => (done ? missHabit(h.id) : completeHabit(h.id))}
                    >
                      <Check className="size-4" />
                      {done ? "Vote cast" : "Fired after the cue"}
                    </Button>
                    {!done ? (
                      <Button size="sm" variant="ghost" onClick={() => shrinkHabit(h.id)}>
                        Shrink
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted">Not cued today.</p>
                )}
                <button
                  type="button"
                  className="mt-2 text-xs text-muted underline"
                  onClick={() => setEditing(h)}
                >
                  Edit 3 Rs and environment
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {layer === "design" && (
        <div className="mt-4 flex flex-col gap-3">
          <Card>
            <p className="font-medium">Four laws</p>
            <p className="text-sm text-muted">
              Obvious cue. Attractive pairing. Easy two-minute start. Satisfying celebration.
              Invert them to unlearn.
            </p>
            <Link to="/unlearn" className="mt-2 inline-block text-sm font-medium">
              Open Unlearn →
            </Link>
          </Card>
          {pinned.map((h) => (
            <Card key={h.id}>
              <p className="font-medium">{h.tinyAct}</p>
              {(
                [
                  ["obvious", "Cue is visible"],
                  ["attractive", "Paired with a want or identity"],
                  ["easy", "Tools placed, two minutes"],
                  ["satisfying", "Immediate mark"],
                ] as const
              ).map(([k, label]) => (
                <div key={k} className="flex items-center justify-between py-2">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={h.env[k]}
                    onCheckedChange={(v) =>
                      updateHabit(h.id, { env: { ...h.env, [k]: v } })
                    }
                  />
                </div>
              ))}
              <p className="mt-2 text-xs text-muted">How automatic does it feel, 1–7?</p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => scoreAutomaticity(h.id, n)}
                    className={cn(
                      "size-9 rounded-full text-sm",
                      h.automaticity[0]?.score === n ? "bg-fg text-bg" : "bg-sunken",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <HabitBuilder open={builder} onClose={() => setBuilder(false)} />
      {editing ? (
        <EditHabit habit={editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}

function HabitBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addHabit = useStore((s) => s.addHabit);
  const [identity, setIdentity] = useState("I am someone who");
  const [tinyAct, setTinyAct] = useState("");
  const [cueRoutine, setCueRoutine] = useState("");
  const [cuePlace, setCuePlace] = useState("");
  const [prompt, setPrompt] = useState("");
  const [pillar, setPillar] = useState<Pillar>("physical");
  const tooLong = estimateMinutes(tinyAct) > 2;

  return (
    <Modal open={open} onClose={onClose} title="If this, then that">
      <div className="flex flex-col gap-3">
        <Input value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="Identity" />
        <Input value={tinyAct} onChange={(e) => setTinyAct(e.target.value)} placeholder="Tiny act ≤ 2 min" />
        {tooLong ? <p className="text-sm text-danger">Shrink it. Two minutes is the door.</p> : null}
        <Input
          value={cueRoutine}
          onChange={(e) => setCueRoutine(e.target.value)}
          placeholder="After I (existing routine)"
        />
        <Input value={cuePlace} onChange={(e) => setCuePlace(e.target.value)} placeholder="In (place)" />
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="The thing I will see"
        />
        <div className="flex flex-wrap gap-1.5">
          {PILLARS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPillar(p)}
              className={cn(
                "h-9 rounded-full px-3 text-xs",
                pillar === p ? "text-bg" : "bg-sunken text-muted",
              )}
              style={pillar === p ? { background: PILLAR_META[p].color } : undefined}
            >
              {PILLAR_META[p].label}
            </button>
          ))}
        </div>
        <Button
          disabled={!tinyAct || !cueRoutine || tooLong}
          onClick={() => {
            addHabit({
              identity,
              tinyAct,
              fullAct: tinyAct,
              pillar,
              cueRoutine,
              cuePlace,
              prompt,
              daysOfWeek: DOW_DEFAULT,
              reminder: "",
              ritualNote: "",
              keystone: false,
              env: { obvious: true, attractive: false, easy: true, satisfying: false },
              kind: "habit",
            });
            onClose();
          }}
        >
          Pin
        </Button>
      </div>
    </Modal>
  );
}

function EditHabit({ habit, onClose }: { habit: Habit; onClose: () => void }) {
  const updateHabit = useStore((s) => s.updateHabit);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const [days, setDays] = useState(habit.daysOfWeek);
  const [reminder, setReminder] = useState(habit.reminder);
  const [ritual, setRitual] = useState(habit.ritualNote);
  const curve = useMemo(() => habit.automaticity.slice().reverse(), [habit.automaticity]);

  function toggleDay(d: number) {
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()));
  }

  return (
    <Modal open onClose={onClose} title="Reminder, repetition, ritual">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">{habit.tinyAct}</p>
        <p className="text-xs font-medium">Repetition — not every day</p>
        <div className="flex gap-1">
          {DOW.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={cn(
                "size-10 rounded-full text-xs",
                days.includes(i) ? "bg-fg text-bg" : "bg-sunken text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="text-sm">Reminder time</label>
        <Input type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} />
        <label className="text-sm">Ritual note</label>
        <Input
          value={ritual}
          onChange={(e) => setRitual(e.target.value)}
          placeholder="Same place, same order"
        />
        {curve.length > 0 ? (
          <p className="text-xs text-muted">
            Automaticity over time: {curve.map((c) => c.score).join(" → ")} — not a countdown to
            day 66.
          </p>
        ) : null}
        <Button
          onClick={() => {
            updateHabit(habit.id, { daysOfWeek: days, reminder, ritualNote: ritual });
            onClose();
          }}
        >
          Save
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            deleteHabit(habit.id);
            onClose();
          }}
        >
          Remove
        </Button>
      </div>
    </Modal>
  );
}
