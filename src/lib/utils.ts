import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid() {
  return crypto.randomUUID();
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(key: string, n: number) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return todayKey(dt);
}

export function weekday(key = todayKey()) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function weekStart(key = todayKey()) {
  const dow = weekday(key);
  const back = dow === 0 ? 6 : dow - 1;
  return addDays(key, -back);
}

export function formatShortDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function formatLongDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export function hoursUntil(isoOrKey: string) {
  const end =
    isoOrKey.length <= 10 ? new Date(`${isoOrKey}T23:59:59`) : new Date(isoOrKey);
  return Math.max(0, Math.round((end.getTime() - Date.now()) / 36e5));
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function mean(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function estimateMinutes(text: string) {
  const t = text.toLowerCase();
  const m = t.match(/(\d+)\s*(min|minute)/);
  if (m) return Number(m[1]);
  if (/\btwo\s+minutes?\b/.test(t)) return 2;
  if (/\bone\s+minute\b/.test(t)) return 1;
  if (/\b(hour|60)\b/.test(t)) return 60;
  if (/\b(second|breath|gratitude|awe|thirty)\b/.test(t)) return 1;
  return 5;
}

export function shrinkAct(act: string) {
  const mins = estimateMinutes(act);
  if (mins > 2) return act.replace(/\d+\s*(min|minute)s?/i, "2 minutes");
  if (/walk/.test(act)) return "Put on shoes and step outside";
  if (/read/.test(act)) return "Open the book and read one paragraph";
  return "The first 30 seconds of: " + act;
}

export function pad2(n: number) {
  return String(Math.floor(Math.abs(n))).padStart(2, "0");
}

export function formatClock(totalSec: number) {
  const sign = totalSec < 0 ? "-" : "";
  const s = Math.abs(Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${sign}${h}:${pad2(m)}:${pad2(sec)}`;
  return `${sign}${m}:${pad2(sec)}`;
}

export function formatDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.round(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}

export function formatTime(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const am = h < 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(m)} ${am ? "AM" : "PM"}`;
}

export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;
