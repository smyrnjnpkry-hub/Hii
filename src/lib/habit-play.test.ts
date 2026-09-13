import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dayChain,
  isDueOn,
  neverMissTwice,
  scheduledStreak,
  todayVotes,
} from "./habit-play.ts";
import type { Habit } from "./types.ts";

function habit(partial: Partial<Habit> & Pick<Habit, "daysOfWeek" | "completions">): Habit {
  return {
    id: "h1",
    identity: "I am someone who keeps tiny promises",
    tinyAct: "Stand at the window",
    fullAct: "Stand at the window",
    pillar: "spiritual",
    cueRoutine: "coffee",
    cuePlace: "kitchen",
    prompt: "kettle",
    reminder: "",
    ritualNote: "",
    keystone: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    misses: [],
    automaticity: [],
    shrinkHistory: [],
    env: { obvious: true, attractive: true, easy: true, satisfying: true },
    kind: "habit",
    ...partial,
  };
}

describe("habit play", () => {
  it("counts scheduled-day streaks and ignores off days", () => {
    const h = habit({
      daysOfWeek: [1, 3, 5],
      completions: [
        { date: "2026-09-07", at: "t" },
        { date: "2026-09-09", at: "t" },
        { date: "2026-09-11", at: "t" },
      ],
    });
    assert.equal(isDueOn(h, "2026-09-11"), true);
    assert.equal(scheduledStreak(h, "2026-09-11"), 3);
    assert.equal(scheduledStreak(h, "2026-09-12"), 3);
  });

  it("breaks the streak on a missed scheduled day", () => {
    const h = habit({
      daysOfWeek: [1, 3, 5],
      completions: [{ date: "2026-09-11", at: "t" }],
    });
    assert.equal(scheduledStreak(h, "2026-09-11"), 1);
  });

  it("flags never-miss-twice when the last scheduled day was open", () => {
    const h = habit({
      createdAt: "2026-09-01T00:00:00.000Z",
      daysOfWeek: [1, 3, 5],
      completions: [],
    });
    assert.equal(neverMissTwice(h, "2026-09-14"), true);
  });

  it("does not demand a recovery vote on the first day", () => {
    const h = habit({
      createdAt: "2026-09-14T00:00:00.000Z",
      daysOfWeek: [1, 3, 5],
      completions: [],
    });
    assert.equal(neverMissTwice(h, "2026-09-14"), false);
  });

  it("tallies today's votes and the week chain", () => {
    const h = habit({
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      completions: [{ date: "2026-09-13", at: "t" }],
    });
    const votes = todayVotes([h], "2026-09-13");
    assert.equal(votes.due, 1);
    assert.equal(votes.done, 1);
    assert.equal(votes.complete, true);
    const chain = dayChain([h], "2026-09-13", 3);
    assert.equal(chain.at(-1)?.status, "full");
  });
});
