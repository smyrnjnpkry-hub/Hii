import { Button, Card, Input, Switch } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { ThemeMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const exportJson = useStore((s) => s.exportJson);
  const wipeAll = useStore((s) => s.wipeAll);

  function download() {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spire-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Settings</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Quiet controls.</h1>

      <Card className="mt-5">
        <p className="font-medium">What we call you</p>
        <Input
          className="mt-2"
          value={settings.name}
          onChange={(e) => update({ name: e.target.value })}
        />
        <p className="mt-3 text-sm font-medium">Daily reminder</p>
        <Input
          className="mt-2"
          type="time"
          value={settings.reminderTime}
          onChange={(e) => update({ reminderTime: e.target.value })}
        />
      </Card>

      <Card className="mt-3">
        <p className="font-medium">Theme</p>
        <div className="mt-2 flex gap-1.5">
          {(["light", "dark", "system"] as ThemeMode[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update({ theme: t })}
              className={cn(
                "h-10 flex-1 rounded-full text-sm capitalize",
                settings.theme === t ? "bg-fg text-bg" : "bg-sunken text-muted",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm">Reduce motion</span>
          <Switch
            checked={settings.reduceMotion}
            onCheckedChange={(v) => update({ reduceMotion: v })}
          />
        </div>
      </Card>

      <Card className="mt-3">
        <p className="font-medium">If you are in crisis</p>
        <p className="mt-2 text-sm text-muted">
          This companion cannot replace professional help. In the United States, call or text
          988. Locally, seek emergency services.
        </p>
      </Card>

      <Card className="mt-3">
        <p className="font-medium">About & sources</p>
        <p className="mt-2 text-sm">
          Inspired by Tal Ben-Shahar’s SPIRE / Wholebeing model. Each pillar draws on
          established research (relationships, movement, meaning, gratitude, curiosity). This is
          a wellbeing companion, not therapy.
        </p>
        <ul className="mt-3 list-disc pl-4 text-sm text-muted">
          <li>Tal Ben-Shahar, Happiness Studies: An Introduction (2021), “The SPIRE of Happiness”</li>
          <li>Happier, No Matter What (2021)</li>
          <li>Happy Habits (2025) — MVIs and the 3 Rs</li>
          <li>Wholebeing Institute SPIRE check-in</li>
          <li>Mauss et al. 2011 — valuing happiness paradox</li>
          <li>Harvard Study of Adult Development — relationships</li>
          <li>Gratitude research (Emmons); exercise–mood; meaning and mindfulness literatures</li>
          <li>Wood, Fogg, Lally, Gollwitzer, Steel, Pychyl, Ericsson, Bjork, Azrin — habit, delay, skill, unlearn</li>
          <li>Lancet Commission 2024 — modifiable dementia-risk factors (education, not diagnosis)</li>
        </ul>
      </Card>

      <Card className="mt-3">
        <p className="font-medium">Your data stays here</p>
        <p className="text-sm text-muted">No account. Export or delete anytime.</p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={download}>
            Export
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => {
              if (confirm("Delete everything on this device?")) wipeAll();
            }}
          >
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}
