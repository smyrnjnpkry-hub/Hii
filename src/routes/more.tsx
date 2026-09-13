import { Card } from "@/components/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookMarked,
  BookOpen,
  Brain,
  Compass,
  Flame,
  GraduationCap,
  HeartPulse,
  LineChart,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Timer,
} from "lucide-react";

export const Route = createFileRoute("/more")({ component: MorePage });

const LINKS = [
  { to: "/check-in", label: "Check-in", hint: "Five colors, a quiet look", icon: SlidersHorizontal },
  { to: "/journal", label: "Journal", hint: "Write without grading the day", icon: BookOpen },
  { to: "/learn", label: "Learn SPIRE", hint: "Five lessons and the prism", icon: BookMarked },
  { to: "/start", label: "Start engine", hint: "When you stall — emotion, then action", icon: Timer },
  { to: "/week", label: "Week OS", hint: "Three MITs across a whole life", icon: Compass },
  { to: "/brain", label: "Cognitive health", hint: "A lifestyle stack, not a brain age", icon: Brain },
  { to: "/agency", label: "Take control", hint: "Values, identity, smaller surface", icon: Sparkles },
  { to: "/skill", label: "Skill studio", hint: "Deliberate practice, not hours", icon: GraduationCap },
  { to: "/unlearn", label: "Unlearn", hint: "Replace the old cue, do not just stop", icon: Flame },
  { to: "/progress", label: "Progress", hint: "Weekly recap, never a happiness grade", icon: LineChart },
  { to: "/settings", label: "Settings & sources", hint: "Theme, reminder, crisis, About", icon: Settings },
];

function MorePage() {
  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">More</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">The rest of the prism.</h1>
      <p className="mt-2 text-sm text-muted">
        Habits live in Habits. Routines and Tasks are in the bar. These rooms go deeper.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        {LINKS.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.to} to={l.to}>
              <Card className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-sunken">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{l.label}</span>
                  <span className="block text-sm text-muted">{l.hint}</span>
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted">
        <HeartPulse className="size-4" />
        If you are in crisis, this app cannot replace help. US: call or text 988.
      </p>
    </div>
  );
}
