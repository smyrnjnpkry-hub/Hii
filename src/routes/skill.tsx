import { Button, Card, Input, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import { uid } from "@/lib/utils";
import type { SkillStage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/skill")({ component: SkillPage });

const STAGES: SkillStage[] = ["cognitive", "associative", "autonomous"];

function SkillPage() {
  const skill = useStore((s) => s.skill);
  const setSkill = useStore((s) => s.setSkill);
  const addSession = useStore((s) => s.addSession);
  const addTestScore = useStore((s) => s.addTestScore);
  const [name, setName] = useState(skill?.name ?? "");
  const [good, setGood] = useState(skill?.goodEnough ?? "");
  const [test, setTest] = useState(skill?.test ?? "");
  const [sub, setSub] = useState("");
  const [target, setTarget] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [diff, setDiff] = useState(6);
  const [easy, setEasy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [next, setNext] = useState("");
  const [subId, setSubId] = useState(skill?.subskills[0]?.id ?? "");
  const [score, setScore] = useState(5);

  const plateau = useMemo(() => {
    if (!skill) return false;
    const last = skill.sessions.slice(0, 3);
    if (last.length < 3) return false;
    const flat = last.every((s) => s.difficulty <= last[0].difficulty);
    const time = last.reduce((a, s) => a + s.minutes, 0) >= 60;
    return flat && time;
  }, [skill]);

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Skill studio</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        Practice at the edge.
      </h1>
      <p className="mt-2 text-sm text-muted">
        Naive repetition builds the OK plateau. Deliberate practice: a specific target, full
        attention, feedback, slightly too hard. Hours are not the score.
      </p>

      <Card className="mt-5">
        <p className="font-medium">One skill, twelve weeks</p>
        <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <Textarea
          className="mt-2"
          value={good}
          onChange={(e) => setGood(e.target.value)}
          placeholder="Observable ‘good enough’ — not ‘get good at Spanish’"
        />
        <Textarea
          className="mt-2"
          value={test}
          onChange={(e) => setTest(e.target.value)}
          placeholder="A 10-minute fixed test you will retake every 14 days"
        />
        <div className="mt-2 flex gap-2">
          <Input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="Add a sub-skill" />
          <Button
            variant="outline"
            disabled={!sub.trim() || !skill}
            onClick={() => {
              if (!skill) return;
              setSkill({
                ...skill,
                subskills: [
                  ...skill.subskills,
                  { id: uid(), name: sub.trim(), stage: "cognitive" },
                ],
              });
              setSub("");
            }}
          >
            Add
          </Button>
        </div>
        <Button
          className="mt-3 w-full"
          onClick={() =>
            setSkill({
              id: skill?.id ?? uid(),
              name,
              goodEnough: good,
              test,
              subskills: skill?.subskills?.length
                ? skill.subskills
                : [{ id: uid(), name: "First piece", stage: "cognitive" }],
              sessions: skill?.sessions ?? [],
              testScores: skill?.testScores ?? [],
            })
          }
        >
          Save skill
        </Button>
      </Card>

      {skill ? (
        <>
          <div className="mt-4 flex flex-col gap-2">
            {skill.subskills.map((s) => (
              <Card key={s.id} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted">{s.stage}</p>
                </div>
                <div className="flex gap-1">
                  {STAGES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() =>
                        setSkill({
                          ...skill,
                          subskills: skill.subskills.map((x) =>
                            x.id === s.id ? { ...x, stage: st } : x,
                          ),
                        })
                      }
                      className={cn(
                        "h-8 rounded-full px-2 text-[10px]",
                        s.stage === st ? "bg-fg text-bg" : "bg-sunken text-muted",
                      )}
                    >
                      {st.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {plateau ? (
            <Card className="mt-4 bg-sunken">
              <p className="font-medium">OK plateau</p>
              <p className="text-sm text-muted">
                Time is high and difficulty is flat. Demand a harder drill, a constraint, or a
                coach. Comfortable reps are maintenance.
              </p>
            </Card>
          ) : null}

          <Card className="mt-4">
            <p className="font-medium">Practice card</p>
            <select
              className="mt-2 h-11 w-full rounded-xl bg-sunken px-3 text-sm"
              value={subId}
              onChange={(e) => setSubId(e.target.value)}
            >
              {skill.subskills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.stage}
                </option>
              ))}
            </select>
            <Input
              className="mt-2"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Target for THIS session — harder than last time"
            />
            <div className="mt-2 flex gap-2">
              <Input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
              <Input
                type="number"
                min={1}
                max={10}
                value={diff}
                onChange={(e) => setDiff(Number(e.target.value))}
              />
            </div>
            <p className="mt-1 text-xs text-muted">Minutes · difficulty 1–10. 12 min is allowed if energy is low — still at the edge.</p>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={easy} onChange={(e) => setEasy(e.target.checked)} />
              This felt easy (next session must be harder)
            </label>
            <Textarea
              className="mt-2"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What failed"
            />
            <Input
              className="mt-2"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="One change for next session"
            />
            <Button
              className="mt-3 w-full"
              disabled={!target}
              onClick={() =>
                addSession({
                  subskillId: subId || skill.subskills[0]?.id,
                  target,
                  minutes,
                  difficulty: diff,
                  easy,
                  feedback,
                  nextChange: next,
                })
              }
            >
              Log session
            </Button>
          </Card>

          <Card className="mt-3">
            <p className="font-medium">Fixed test</p>
            <p className="text-sm text-muted">{skill.test}</p>
            <div className="mt-2 flex gap-2">
              <Input
                type="number"
                min={1}
                max={10}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />
              <Button variant="outline" onClick={() => addTestScore(score)}>
                Save score
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted">
              History: {skill.testScores.map((t) => t.score).join(" → ") || "none yet"}
            </p>
          </Card>

          <div className="mt-3 flex flex-col gap-2">
            {skill.sessions.slice(0, 6).map((s) => (
              <Card key={s.id}>
                <p className="text-xs text-muted">
                  {s.minutes} min · difficulty {s.difficulty}
                  {s.easy ? " · tagged easy" : ""}
                </p>
                <p className="text-sm">{s.target}</p>
                {s.nextChange ? <p className="text-xs text-muted">Next: {s.nextChange}</p> : null}
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
