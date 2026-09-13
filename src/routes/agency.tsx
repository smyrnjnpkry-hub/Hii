import { Button, Card, Input, Textarea } from "@/components/ui";
import { VALUE_OPTIONS } from "@/lib/pillars";
import { useStore } from "@/lib/store";
import { cn, todayKey } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/agency")({ component: AgencyPage });

function AgencyPage() {
  const agency = useStore((s) => s.agency);
  const setAgency = useStore((s) => s.setAgency);
  const saveDaily = useStore((s) => s.saveDailyAgency);
  const addContextReview = useStore((s) => s.addContextReview);
  const today = agency.daily.find((d) => d.date === todayKey());
  const [mit, setMit] = useState(today?.mit ?? "");
  const [no, setNo] = useState(today?.no ?? "");
  const [env, setEnv] = useState(today?.envEdit ?? "");
  const [votes, setVotes] = useState<boolean[]>(
    today?.votes ?? agency.identities.map(() => false),
  );
  const [moments, setMoments] = useState([
    { moment: "", redesign: "" },
    { moment: "", redesign: "" },
    { moment: "", redesign: "" },
  ]);
  const [custom, setCustom] = useState("");

  function toggleValue(name: string) {
    const has = agency.values.find((v) => v.name === name);
    if (has) {
      setAgency({ values: agency.values.filter((v) => v.name !== name) });
      return;
    }
    if (agency.values.length >= 3) return;
    setAgency({
      values: [...agency.values, { name, weeklyBehavior: "", dont: "" }],
    });
  }

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Agency</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        A smaller surface, better designed.
      </h1>
      <p className="mt-2 text-sm text-muted">
        Control is not a mood. Act in “I control.” People believe they act from goals; they
        mostly act from context.
      </p>

      <Card className="mt-5">
        <p className="font-medium">Three values</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {VALUE_OPTIONS.map((v) => {
            const on = agency.values.some((x) => x.name === v);
            return (
              <button
                key={v}
                type="button"
                onClick={() => toggleValue(v)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs",
                  on ? "bg-fg text-bg" : "bg-sunken text-muted",
                )}
              >
                {v}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Or type one" />
          <Button
            variant="outline"
            disabled={!custom.trim() || agency.values.length >= 3}
            onClick={() => {
              toggleValue(custom.trim());
              setCustom("");
            }}
          >
            Add
          </Button>
        </div>
        {agency.values.map((v, i) => (
          <div key={v.name} className="mt-3">
            <p className="text-sm font-medium">{v.name}</p>
            <Input
              className="mt-1"
              value={v.weeklyBehavior}
              onChange={(e) => {
                const next = agency.values.slice();
                next[i] = { ...v, weeklyBehavior: e.target.value };
                setAgency({ values: next });
              }}
              placeholder="Weekly behavior"
            />
            <Input
              className="mt-1"
              value={v.dont}
              onChange={(e) => {
                const next = agency.values.slice();
                next[i] = { ...v, dont: e.target.value };
                setAgency({ values: next });
              }}
              placeholder="I don’t do X anymore"
            />
          </div>
        ))}
      </Card>

      <Card className="mt-3">
        <p className="font-medium">Identity board</p>
        {agency.identities.map((id, i) => (
          <Input
            key={i}
            className="mt-2"
            value={id}
            onChange={(e) => {
              const next = agency.identities.slice();
              next[i] = e.target.value;
              setAgency({ identities: next });
            }}
          />
        ))}
        {agency.identities.length < 3 ? (
          <Button
            className="mt-2"
            variant="ghost"
            onClick={() => setAgency({ identities: [...agency.identities, "I am a person who…"] })}
          >
            Add identity
          </Button>
        ) : null}
      </Card>

      <div className="mt-3 grid gap-2">
        {(
          [
            ["I control", "control"],
            ["I influence", "influence"],
            ["I don’t control", "dont"],
          ] as const
        ).map(([label, key]) => (
          <Card key={key}>
            <p className="text-sm font-medium">{label}</p>
            {agency.control[key].map((line, i) => (
              <Input
                key={i}
                className="mt-2"
                value={line}
                onChange={(e) => {
                  const col = agency.control[key].slice();
                  col[i] = e.target.value;
                  setAgency({ control: { ...agency.control, [key]: col } });
                }}
              />
            ))}
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <p className="font-medium">Today — three minutes</p>
        <Input
          className="mt-2"
          value={mit}
          onChange={(e) => setMit(e.target.value)}
          placeholder="One MIT in I-control"
        />
        <Input className="mt-2" value={no} onChange={(e) => setNo(e.target.value)} placeholder="One no" />
        <Input
          className="mt-2"
          value={env}
          onChange={(e) => setEnv(e.target.value)}
          placeholder="One environment edit"
        />
        {agency.identities.map((id, i) => (
          <button
            key={id + i}
            type="button"
            onClick={() => {
              const next = votes.slice();
              next[i] = !next[i];
              setVotes(next);
            }}
            className={cn(
              "mt-2 flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm",
              votes[i] ? "bg-fg text-bg" : "bg-sunken",
            )}
          >
            Vote: {id}
          </button>
        ))}
        <Button
          className="mt-3 w-full"
          onClick={() => saveDaily({ mit, no, envEdit: env, votes })}
        >
          Keep today’s map
        </Button>
      </Card>

      <Card className="mt-3">
        <p className="font-medium">Where did context decide for me?</p>
        {moments.map((m, i) => (
          <div key={i} className="mt-2">
            <Input
              value={m.moment}
              onChange={(e) => {
                const next = moments.slice();
                next[i] = { ...m, moment: e.target.value };
                setMoments(next);
              }}
              placeholder={`Moment ${i + 1}`}
            />
            <Input
              className="mt-1"
              value={m.redesign}
              onChange={(e) => {
                const next = moments.slice();
                next[i] = { ...m, redesign: e.target.value };
                setMoments(next);
              }}
              placeholder="Friction to add or remove"
            />
          </div>
        ))}
        <Button
          className="mt-3"
          variant="outline"
          onClick={() => addContextReview({ moments })}
        >
          Save Wood loop
        </Button>
      </Card>

      <p className="mt-4 text-sm text-muted">
        Overwhelmed? Shrink to one controllable two-minute act. Choose — never “you must.”
      </p>
      <Textarea className="hidden" readOnly value="" />
    </div>
  );
}
