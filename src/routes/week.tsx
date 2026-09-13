import { Button, Card, Input, Textarea } from "@/components/ui";
import { DOMAIN_META } from "@/lib/pillars";
import { lastNightSleep, useStore } from "@/lib/store";
import { DOMAINS, type Domain, type MitStatus } from "@/lib/types";
import { addDays, cn, hoursUntil, todayKey, weekStart } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/week")({ component: WeekPage });

function WeekPage() {
  const plans = useStore((s) => s.plans);
  const setPlan = useStore((s) => s.setPlan);
  const mits = useStore((s) => s.mits);
  const addMit = useStore((s) => s.addMit);
  const updateMit = useStore((s) => s.updateMit);
  const completeMit = useStore((s) => s.completeMit);
  const skipMit = useStore((s) => s.skipMit);
  const addReview = useStore((s) => s.addReview);
  const reviews = useStore((s) => s.reviews);
  const sleepLog = useStore((s) => s.sleepLog);
  const logSleep = useStore((s) => s.logSleep);
  const sleep = lastNightSleep({ sleepLog });
  const today = todayKey();
  const start = weekStart(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const [title, setTitle] = useState("");
  const [cue, setCue] = useState("After I sit down, at the desk");
  const [domain, setDomain] = useState<Domain>("craft");
  const [review, setReview] = useState({
    cuesFired: "",
    stalled: "",
    friction: "",
    identityVote: "",
  });
  const openToday = mits.filter((m) => m.due === today && m.status === "open").length;
  const loadCut = (sleep?.hours ?? 8) < 6.5;

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Whole-life week</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Three starts. Six domains.</h1>
      <p className="mt-2 text-sm text-muted">
        Recovery is not earned. People and play have the same dignity as craft. Cap: three MITs a
        day.
      </p>

      <Card className="mt-4">
        <p className="text-sm font-medium">Last night’s sleep (hours)</p>
        <Input
          className="mt-2"
          type="number"
          min={0}
          max={14}
          step={0.5}
          value={sleep?.hours ?? ""}
          onChange={(e) => logSleep(Number(e.target.value))}
          placeholder="7.5"
        />
        {loadCut ? (
          <p className="mt-2 text-sm text-danger">
            Under 6.5h — keep one MIT. Walk twenty minutes. Lights out earlier.
          </p>
        ) : null}
      </Card>

      <div className="mt-5 flex flex-col gap-2">
        {DOMAINS.map((d) => {
          const p = plans.find((x) => x.domain === d)!;
          const meta = DOMAIN_META[d];
          return (
            <Card key={d}>
              <p className="font-medium">{meta.label}</p>
              <p className="text-xs text-muted">{meta.hint}</p>
              <Input
                className="mt-2"
                value={p.weeklyOutcome}
                onChange={(e) => setPlan(d, { weeklyOutcome: e.target.value })}
                placeholder="This week’s observable outcome"
              />
              <Input
                className="mt-2"
                value={p.tinyAct}
                onChange={(e) => setPlan(d, { tinyAct: e.target.value })}
                placeholder="Daily tiny act"
              />
              <Input
                className="mt-2"
                value={p.killCriterion}
                onChange={(e) => setPlan(d, { killCriterion: e.target.value })}
                placeholder="I will not…"
              />
            </Card>
          );
        })}
      </div>

      <Card className="mt-5">
        <p className="font-medium">Place a MIT</p>
        <p className="text-xs text-muted">
          Today has {openToday} open. {loadCut ? "Cap is 1." : "Cap is 3."}
        </p>
        <Input
          className="mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <Input
          className="mt-2"
          value={cue}
          onChange={(e) => setCue(e.target.value)}
          placeholder="Start cue — after X, at Y"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DOMAINS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDomain(d)}
              className={cn(
                "h-9 rounded-full px-3 text-xs",
                domain === d ? "bg-fg text-bg" : "bg-sunken text-muted",
              )}
            >
              {DOMAIN_META[d].label}
            </button>
          ))}
        </div>
        <Button
          className="mt-3 w-full"
          disabled={!title.trim() || openToday >= (loadCut ? 1 : 3)}
          onClick={() => {
            addMit({ title: title.trim(), startCue: cue, domain, due: today });
            setTitle("");
          }}
        >
          Assign to today
        </Button>
      </Card>

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-muted">This week</p>
      <div className="mt-2 flex flex-col gap-2">
        {days.map((d) => {
          const list = mits.filter((m) => m.due === d);
          return (
            <Card key={d} className={cn(d === today && "ring-1 ring-primary/40")}>
              <p className="text-xs text-muted">{d}</p>
              {list.length === 0 ? (
                <p className="text-sm text-muted">Empty on purpose is allowed.</p>
              ) : (
                list.map((m) => (
                  <MitRow
                    key={m.id}
                    title={m.title}
                    cue={m.startCue}
                    hours={hoursUntil(m.due)}
                    status={m.status}
                    carried={!!m.carriedFrom}
                    onDone={() => completeMit(m.id)}
                    onSkip={(feeling) => skipMit(m.id, feeling)}
                    onMove={() => updateMit(m.id, { due: addDays(d, 1), carriedFrom: m.carriedFrom || d })}
                  />
                ))
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <p className="font-medium">Twelve-minute weekly review</p>
        <Textarea
          className="mt-2 min-h-16"
          value={review.cuesFired}
          onChange={(e) => setReview({ ...review, cuesFired: e.target.value })}
          placeholder="Which cues fired?"
        />
        <Textarea
          className="mt-2 min-h-16"
          value={review.stalled}
          onChange={(e) => setReview({ ...review, stalled: e.target.value })}
          placeholder="Where did emotion stall?"
        />
        <Textarea
          className="mt-2 min-h-16"
          value={review.friction}
          onChange={(e) => setReview({ ...review, friction: e.target.value })}
          placeholder="One friction to add or remove"
        />
        <Textarea
          className="mt-2 min-h-16"
          value={review.identityVote}
          onChange={(e) => setReview({ ...review, identityVote: e.target.value })}
          placeholder="One identity vote to keep"
        />
        <Button
          className="mt-3 w-full"
          variant="outline"
          onClick={() =>
            addReview({
              weekOf: start,
              ...review,
            })
          }
        >
          Save review
        </Button>
        {reviews[0] ? (
          <p className="mt-2 text-xs text-muted">Last review: {reviews[0].weekOf}</p>
        ) : null}
      </Card>
    </div>
  );
}

function MitRow({
  title,
  cue,
  hours,
  status,
  carried,
  onDone,
  onSkip,
  onMove,
}: {
  title: string;
  cue: string;
  hours: number;
  status: MitStatus;
  carried: boolean;
  onDone: () => void;
  onSkip: (feeling: string) => void;
  onMove: () => void;
}) {
  return (
    <div className="mt-2 border-t border-border pt-2">
      <p className={cn("text-sm font-medium", status === "done" && "text-muted line-through")}>
        {title}
      </p>
      <p className="text-xs text-muted">
        {cue} · {hours}h{carried ? " · carried" : ""} · {status}
      </p>
      {status === "open" ? (
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={onDone}>
            Done
          </Button>
          <Button size="sm" variant="outline" onClick={() => onSkip("unclear")}>
            Skip
          </Button>
          <Button size="sm" variant="ghost" onClick={onMove}>
            +1 day
          </Button>
        </div>
      ) : null}
    </div>
  );
}
