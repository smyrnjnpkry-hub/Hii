import { Button, Card, Input, Switch, Textarea } from "@/components/ui";
import { STALL_FEELINGS } from "@/lib/pillars";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/unlearn")({ component: UnlearnPage });

const CLINICAL = ["tic", "hair", "skin pick", "stutter", "nail"];

function UnlearnPage() {
  const unlearn = useStore((s) => s.unlearn);
  const setUnlearn = useStore((s) => s.setUnlearn);
  const logUrge = useStore((s) => s.logUrge);
  const logLapse = useStore((s) => s.logLapse);
  const [surf, setSurf] = useState<"off" | "surf" | "compete">("off");
  const [left, setLeft] = useState(90);
  const [feeling, setFeeling] = useState("restless");
  const [acted, setActed] = useState(false);
  const [lapseNote, setLapseNote] = useState("");

  useEffect(() => {
    if (surf === "off") return;
    const id = window.setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          if (surf === "surf") {
            setSurf("compete");
            return 180;
          }
          setSurf("off");
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [surf]);

  if (!unlearn) {
    return (
      <div className="px-4 pb-28 pt-6">
        <h1 className="font-display text-3xl font-semibold">Unlearn</h1>
        <p className="mt-2 text-sm text-muted">No habit loaded.</p>
      </div>
    );
  }

  const clinical = CLINICAL.some((k) => unlearn.name.toLowerCase().includes(k));
  const uniqueDays = new Set(unlearn.urgeLogs.map((u) => u.date)).size;

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Unlearn</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        Always replace. Never just stop.
      </h1>
      <p className="mt-2 text-sm text-muted">
        Old cue→response links remain. Starve the reward. Install a competing response in the
        same slot.
      </p>

      {clinical ? (
        <Card className="mt-4 bg-sunken">
          <p className="font-medium">Work with a clinician.</p>
          <p className="text-sm text-muted">
            Habit reversal is a well-established therapy for tics and body-focused repetitive
            behaviors. These tools are general awareness and replacement, not treatment.
          </p>
        </Card>
      ) : null}

      <Card className="mt-4">
        <p className="text-xs text-muted">Name it in verbs</p>
        <Input
          className="mt-1"
          value={unlearn.name}
          onChange={(e) => setUnlearn({ ...unlearn, name: e.target.value })}
        />
        <p className="mt-3 text-xs text-muted">Cue map</p>
        {(
          [
            ["time", "Time"],
            ["place", "Place"],
            ["preceding", "Preceding action"],
            ["people", "People"],
            ["emotion", "Emotion"],
            ["body", "Body signal"],
          ] as const
        ).map(([k, label]) => (
          <Input
            key={k}
            className="mt-2"
            value={unlearn.cue[k]}
            onChange={(e) =>
              setUnlearn({ ...unlearn, cue: { ...unlearn.cue, [k]: e.target.value } })
            }
            placeholder={label}
          />
        ))}
        <p className="mt-3 text-xs text-muted">What mood does this repair?</p>
        <Input
          className="mt-1"
          value={unlearn.payoff}
          onChange={(e) => setUnlearn({ ...unlearn, payoff: e.target.value })}
        />
        <p className="mt-3 text-xs text-muted">Competing response (1–3 min, incompatible)</p>
        <Input
          className="mt-1"
          value={unlearn.competingResponse}
          onChange={(e) => setUnlearn({ ...unlearn, competingResponse: e.target.value })}
        />
        <p className="mt-3 text-xs text-muted">Replacement in the same cue</p>
        <Input
          className="mt-1"
          value={unlearn.replacement}
          onChange={(e) => setUnlearn({ ...unlearn, replacement: e.target.value })}
        />
      </Card>

      <Card className="mt-3">
        <p className="font-medium">
          {unlearn.phase === "awareness" ? "Awareness first" : "Active replacement"}
        </p>
        <p className="text-sm text-muted">
          {uniqueDays}/3 days of urge logs. Heavy quitting starts after awareness.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {STALL_FEELINGS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFeeling(f)}
              className={cn(
                "h-9 rounded-full px-3 text-xs",
                feeling === f ? "bg-fg text-bg" : "bg-sunken text-muted",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="mt-3 flex items-center justify-between text-sm">
          I already started the old act
          <Switch checked={acted} onCheckedChange={setActed} />
        </label>
        {surf === "off" ? (
          <Button
            className="mt-3 w-full"
            onClick={() => {
              logUrge({
                place: unlearn.cue.place,
                feeling,
                acted,
                surfed: true,
              });
              setLeft(90);
              setSurf("surf");
            }}
          >
            Urge · 90s surf
          </Button>
        ) : (
          <div className="mt-4 text-center">
            <p className="font-display text-5xl tabular-nums">{left}s</p>
            <p className="text-sm text-muted">
              {surf === "surf"
                ? "The urge peaks and falls. Stay."
                : unlearn.competingResponse || "Incompatible action."}
            </p>
          </div>
        )}
      </Card>

      <Card className="mt-3">
        <p className="font-medium">Invert the four laws for the old act</p>
        {(
          [
            ["invisible", "Invisible — remove the cue object"],
            ["unattractive", "Unattractive — name the real cost"],
            ["difficult", "Difficult — extra steps"],
            ["unsatisfying", "Unsatisfying — no reward nearby"],
          ] as const
        ).map(([k, label]) => (
          <div key={k} className="flex items-center justify-between py-2">
            <span className="text-sm">{label}</span>
            <Switch
              checked={unlearn.friction[k]}
              onCheckedChange={(v) =>
                setUnlearn({
                  ...unlearn,
                  friction: { ...unlearn.friction, [k]: v },
                })
              }
            />
          </div>
        ))}
      </Card>

      <Card className="mt-3">
        <p className="font-medium">The cue won. We redesign the cue.</p>
        <p className="text-sm text-muted">A lapse is not an identity collapse.</p>
        <Textarea
          className="mt-2"
          value={lapseNote}
          onChange={(e) => setLapseNote(e.target.value)}
          placeholder="Which cue fired?"
        />
        <Button
          className="mt-3"
          variant="outline"
          onClick={() => {
            logLapse(unlearn.cue.place, lapseNote);
            setLapseNote("");
          }}
        >
          Log lapse
        </Button>
        {unlearn.lapses[0] ? (
          <p className="mt-2 text-xs text-muted">{unlearn.lapses.length} lapses recorded. Keep replacing.</p>
        ) : null}
      </Card>
    </div>
  );
}
