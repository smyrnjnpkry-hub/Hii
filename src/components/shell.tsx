import { Onboarding } from "@/components/onboarding";
import { Button } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CheckSquare,
  ListOrdered,
  MoreHorizontal,
  Repeat2,
  SunMedium,
  X,
} from "lucide-react";
import { useEffect } from "react";

const NAV = [
  { to: "/", label: "Today", icon: SunMedium },
  { to: "/routines", label: "Routines", icon: ListOrdered },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/habits", label: "Habits", icon: Repeat2 },
  { to: "/more", label: "More", icon: MoreHorizontal },
];

export function StoreBoot() {
  const setHydrated = useStore((s) => s.setHydrated);
  const hydrateDay = useStore((s) => s.hydrateDay);
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    const result = useStore.persist.rehydrate();
    Promise.resolve(result).then(() => {
      setHydrated();
      hydrateDay();
    });
  }, [hydrateDay, setHydrated]);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = settings.theme === "dark" || (settings.theme === "system" && systemDark);
    root.classList.toggle("dark", dark);
    root.classList.toggle("reduce-motion", settings.reduceMotion);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#121714" : "#f4f0e8");
  }, [settings.theme, settings.reduceMotion]);

  return null;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const onboarded = useStore((s) => s.settings.onboarded);
  const alerts = useStore((s) => s.alerts);
  const dismiss = useStore((s) => s.dismissAlert);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideNav = pathname.startsWith("/run/");

  if (!onboarded) return <Onboarding />;

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-lg bg-bg">
      {alerts[0] ? (
        <div className="sticky top-0 z-40 px-3 pt-3">
          <div className="flex items-start gap-3 rounded-2xl bg-fg px-3 py-3 text-bg shadow-card">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{alerts[0].title}</p>
              <p className="text-sm opacity-80">{alerts[0].body}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-9 text-bg hover:bg-bg/10"
              onClick={() => dismiss(alerts[0].id)}
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
      <main className={hideNav ? "" : undefined}>{children}</main>
      {hideNav ? null : (
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg border-t border-border bg-bg/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
        <ul className="grid grid-cols-5 px-1 pt-1">
          {NAV.map((n) => {
            const on =
              n.to === "/"
                ? pathname === "/"
                : n.to === "/routines"
                  ? pathname.startsWith("/routine") || pathname.startsWith("/run/")
                  : pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium",
                    on ? "text-fg" : "text-faint",
                  )}
                >
                  <Icon className="size-5" strokeWidth={on ? 2.2 : 1.8} />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      )}
    </div>
  );
}
