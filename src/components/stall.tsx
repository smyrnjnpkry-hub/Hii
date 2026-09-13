import { Button, Input, Modal } from "@/components/ui";
import { START_REWARDS, STALL_FEELINGS } from "@/lib/pillars";
import { useStore } from "@/lib/store";
import type { Mit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function StallFlow({
  mit,
  open,
  onClose,
}: {
  mit: Mit | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateMit = useStore((s) => s.updateMit);
  const logStart = useStore((s) => s.logStart);
  const letters = useStore((s) => s.agency.letters);
  const [feeling, setFeeling] = useState("");
  const [slice, setSlice] = useState("");
  const [reward, setReward] = useState(START_REWARDS[0]);
  const [phase, setPhase] = useState<"stall" | "sprint" | "done">("stall");
  const [left, setLeft] = useState(10 * 60);
  const [breathe, setBreathe] = useState(false);

  useEffect(() => {
    if (!open || !mit) return;
    setFeeling(mit.feeling || "");
    setSlice(mit.firstSlice || "The first two minutes");
    setReward(mit.reward || START_REWARDS[0]);
    setPhase("stall");
    setLeft(10 * 60);
    setBreathe(false);
  }, [open, mit]);

  useEffect(() => {
    if (phase !== "sprint" || breathe) return;
    const id = window.setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          window.clearInterval(id);
          setPhase("done");
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, breathe]);

  if (!mit) return null;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  const letter = letters[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={phase === "stall" ? "You are stalling. That is information." : mit.title}
    >
      {phase === "stall" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Delay is mood repair, not laziness. Name the feeling. Then start ugly.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STALL_FEELINGS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFeeling(f)}
                className={cn(
                  "h-9 rounded-full px-3 text-sm",
                  feeling === f ? "bg-fg text-bg" : "bg-sunken text-muted",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {feeling ? (
            <p>
              You are delaying to not feel {feeling}. Starting does not require feeling ready.
            </p>
          ) : null}
          {letter ? (
            <p className="rounded-xl bg-sunken p-3 text-sm italic text-muted">
              From two-month-out you: “{letter.body.slice(0, 160)}
              {letter.body.length > 160 ? "…" : ""}”
            </p>
          ) : null}
          <label className="text-sm font-medium">Two-minute first slice</label>
          <Input value={slice} onChange={(e) => setSlice(e.target.value)} />
          <label className="text-sm font-medium">Small reward after</label>
          <div className="flex flex-wrap gap-1.5">
            {START_REWARDS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReward(r)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs",
                  reward === r ? "bg-fg text-bg" : "bg-sunken text-muted",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">
            Put the phone face down or in another room. That is how you cut impulsiveness.
          </p>
          <Button
            onClick={() => {
              updateMit(mit.id, { feeling, firstSlice: slice, reward });
              setBreathe(true);
              setPhase("sprint");
            }}
          >
            Three breaths, then the ugly first minute
          </Button>
        </div>
      )}

      {phase === "sprint" && breathe && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="font-display text-2xl">Breathe</p>
          <p className="text-muted">In four. Out six. Three times. Then we start.</p>
          <Button
            onClick={() => {
              setBreathe(false);
              setLeft(10 * 60);
              logStart(mit.id, 0);
            }}
          >
            Start the ten minutes
          </Button>
        </div>
      )}

      {phase === "sprint" && !breathe && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="font-display text-6xl tabular-nums tracking-tight">
            {mm}:{ss}
          </p>
          <p className="text-muted">{slice}</p>
          {mit.bundleWant ? (
            <p className="text-sm">Want allowed only now: {mit.bundleWant}</p>
          ) : null}
          <Button
            variant="outline"
            onClick={() => {
              logStart(mit.id, Math.round((10 * 60 - left) / 60) || 1);
              setPhase("done");
            }}
          >
            Stop with credit
          </Button>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col gap-4 py-2">
          <p className="font-display text-2xl">A start counts.</p>
          <p className="text-muted">
            Ten minutes is success even if the whole task remains. {reward}.
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                setLeft(10 * 60);
                setPhase("sprint");
                setBreathe(false);
              }}
            >
              Another ten
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Enough
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
