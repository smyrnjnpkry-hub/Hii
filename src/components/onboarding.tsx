import { PrismMark } from "@/components/prism";
import { Button, Input, Range } from "@/components/ui";
import { PILLAR_META } from "@/lib/pillars";
import { useStore } from "@/lib/store";
import { EMPTY_SCORES, PILLARS, type Pillar, type Scores } from "@/lib/types";
import { cn, estimateMinutes } from "@/lib/utils";
import { type ReactNode, useState } from "react";

const STEPS = 7;

export function Onboarding() {
  const complete = useStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [scores, setScores] = useState<Scores>({ ...EMPTY_SCORES });
  const [identity, setIdentity] = useState("I am someone who keeps small promises to myself");
  const [tinyAct, setTinyAct] = useState("Stand at the window for one minute");
  const [cueRoutine, setCueRoutine] = useState("I pour my first drink");
  const [cuePlace, setCuePlace] = useState("the kitchen");
  const [prompt, setPrompt] = useState("The kettle or the glass");
  const [pillar, setPillar] = useState<Pillar>("spiritual");
  const tooLong = estimateMinutes(tinyAct) > 2;

  function next() {
    if (step < STEPS - 1) setStep(step + 1);
    else {
      complete({
        name: name.trim() || "Friend",
        reminderTime,
        scores,
        identity,
        tinyAct: tooLong ? "The first 30 seconds of: " + tinyAct : tinyAct,
        cueRoutine,
        cuePlace,
        prompt,
        pillar,
      });
    }
  }

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-28 pt-10">
      <div className="mb-8 flex items-center justify-between">
        <PrismMark className="size-10" />
        <span className="text-xs tabular-nums text-muted">
          {step + 1} / {STEPS}
        </span>
      </div>
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-sunken">
        <div
          className="h-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${((step + 1) / STEPS) * 100}%` }}
        />
      </div>

      {step === 0 && (
        <Screen kicker="A prism, not the sun" title="Do not stare at happiness.">
          <p>
            Happiness is like sunlight — vital, and harmful if you look at it directly. SPIRE is the
            prism. You look at five colors instead.
          </p>
          <div className="flex h-3 overflow-hidden rounded-full">
            {PILLARS.map((p) => (
              <div key={p} className="flex-1" style={{ background: PILLAR_META[p].color }} />
            ))}
          </div>
          <p className="text-muted">
            Wholebeing is not a mood you chase. It is the experience of being well across five
            dimensions. There is no finish line.
          </p>
        </Screen>
      )}

      {step === 1 && (
        <Screen kicker="Five colors" title="S · P · I · R · E">
          <ul className="flex flex-col gap-3">
            {PILLARS.map((p) => {
              const m = PILLAR_META[p];
              return (
                <li key={p} className="flex gap-3 rounded-2xl bg-surface p-3 shadow-card">
                  <span
                    className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-bg"
                    style={{ background: m.color }}
                  >
                    {m.letter}
                  </span>
                  <span>
                    <span className="block font-medium">{m.label}</span>
                    <span className="text-sm text-muted">{m.short}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Screen>
      )}

      {step === 2 && (
        <Screen kicker="The paradox" title="Chasing happy often backfires.">
          <p>
            People who value happiness as a goal can feel worse when life is ordinary. The
            research has a name for this: the happiness paradox.
          </p>
          <p>
            So this companion never nags you to feel happy. It helps you cultivate meaning,
            body, curiosity, relationship, and the courage to feel — so well-being can emerge.
          </p>
          <p className="text-muted">You can feel sad and still take a walk.</p>
        </Screen>
      )}

      {step === 3 && (
        <Screen kicker="Honestly" title="A companion, not therapy.">
          <p>
            Inspired by Tal Ben-Shahar’s SPIRE / Wholebeing model. Each pillar draws on
            established research — relationships, movement, meaning, gratitude, curiosity.
          </p>
          <p>
            This is a wellbeing companion, not a clinical protocol, and not a treatment for
            depression or anxiety. If you are in crisis, this app cannot replace professional
            help. In the US, call or text 988. Locally, seek emergency services.
          </p>
          <p className="text-sm text-muted">
            Continue means you understand that. There is no account and nothing to sign.
          </p>
        </Screen>
      )}

      {step === 4 && (
        <Screen kicker="A small ritual" title="A name, and a time.">
          <label className="block text-sm font-medium">What should we call you?</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
          <label className="mt-2 block text-sm font-medium">Daily reminder</label>
          <Input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
          />
          <p className="text-sm text-muted">
            A quiet nudge to look at the five colors. You can change this later.
          </p>
        </Screen>
      )}

      {step === 5 && (
        <Screen kicker="First check-in" title="How is wholebeing today?">
          <p className="text-sm text-muted">
            1 is thin. 10 is rich. There is no grade. Weekly is enough; daily is welcome.
          </p>
          {PILLARS.map((p) => (
            <div key={p}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm font-medium" style={{ color: PILLAR_META[p].color }}>
                  {PILLAR_META[p].label}
                </span>
                <span className="text-xs text-muted">{PILLAR_META[p].short}</span>
              </div>
              <Range
                value={scores[p]}
                color={PILLAR_META[p].color}
                onChange={(n) => setScores({ ...scores, [p]: n })}
              />
            </div>
          ))}
        </Screen>
      )}

      {step === 6 && (
        <Screen kicker="One tiny vote" title="Identity, then a two-minute act.">
          <p className="text-sm text-muted">
            Habits fire from cues, not from motivation. After an existing routine, do something
            tiny. Missing a day does not reset you.
          </p>
          <label className="text-sm font-medium">I am someone who…</label>
          <Input value={identity} onChange={(e) => setIdentity(e.target.value)} />
          <label className="text-sm font-medium">Tiny act (≤ 2 minutes)</label>
          <Input value={tinyAct} onChange={(e) => setTinyAct(e.target.value)} />
          {tooLong ? (
            <p className="text-sm text-danger">
              That is larger than two minutes. We will shrink it to the first 30 seconds so it
              can actually fire.
            </p>
          ) : null}
          <label className="text-sm font-medium">After I…</label>
          <Input value={cueRoutine} onChange={(e) => setCueRoutine(e.target.value)} />
          <label className="text-sm font-medium">In</label>
          <Input value={cuePlace} onChange={(e) => setCuePlace(e.target.value)} />
          <label className="text-sm font-medium">The prompt I will see</label>
          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <div className="flex flex-wrap gap-1.5">
            {PILLARS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPillar(p)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-medium",
                  pillar === p ? "text-bg" : "bg-sunken text-muted",
                )}
                style={pillar === p ? { background: PILLAR_META[p].color } : undefined}
              >
                {PILLAR_META[p].label}
              </button>
            ))}
          </div>
        </Screen>
      )}

      <div className="mt-auto flex gap-2 pt-6">
        {step > 0 ? (
          <Button variant="ghost" className="flex-1" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : null}
        <Button className="flex-1" onClick={next}>
          {step === STEPS - 1 ? "Enter SPIRE" : step === 3 ? "I understand" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

function Screen({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{kicker}</p>
      <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
