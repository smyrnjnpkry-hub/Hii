import { Button, Card, Input, Modal, Segmented, Textarea } from "@/components/ui";
import { isInTodayView, PRIORITY_LABEL } from "@/lib/tasks";
import { useStore } from "@/lib/store";
import type { Task, TaskPriority, TaskRepeat } from "@/lib/types";
import {
  addDays,
  cn,
  formatShortDate,
  hoursUntil,
  todayKey,
  weekStart,
} from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

type View = "today" | "inbox" | "soon" | "cal" | "done";

const PRI: TaskPriority[] = [1, 2, 3, 4];
const REPEATS: { value: TaskRepeat; label: string }[] = [
  { value: "none", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function priorityClass(p: TaskPriority) {
  if (p === 1) return "text-danger";
  if (p === 2) return "text-relational";
  if (p === 3) return "text-intellectual";
  return "text-faint";
}

function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const projects = useStore((s) => s.taskProjects);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const toggleTask = useStore((s) => s.toggleTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const [view, setView] = useState<View>("today");
  const [quick, setQuick] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [calCursor, setCalCursor] = useState(todayKey());
  const today = todayKey();

  const open = tasks.filter((t) => !t.completedAt);
  const todayList = open.filter((t) => isInTodayView(t, today)).sort(byPriority);
  const inbox = open.filter((t) => !t.dueDate).sort(byPriority);
  const soon = open
    .filter((t) => t.dueDate && t.dueDate > today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.priority - b.priority);
  const done = tasks
    .filter((t) => t.completedAt)
    .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));

  const list =
    view === "today"
      ? todayList
      : view === "inbox"
        ? inbox
        : view === "soon"
          ? soon
          : view === "done"
            ? done
            : [];

  const carried = todayList.filter((t) => t.carriedFrom).length;

  const monthDays = useMemo(() => {
    const start = weekStart(calCursor.slice(0, 8) + "01");
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [calCursor]);

  function submitQuick() {
    const title = quick.trim();
    if (!title) return;
    addTask({
      title,
      dueDate: view === "inbox" ? "" : today,
      projectId: "inbox",
    });
    setQuick("");
  }

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Assignments · reminders · carry-forward
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Tasks</h1>
      <p className="mt-2 text-sm text-muted">
        Incomplete work stays in Today. Completions keep a history. Dates live on the calendar.
      </p>

      <div className="mt-4 overflow-x-auto">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "today", label: "Today" },
            { value: "inbox", label: "Inbox" },
            { value: "soon", label: "Soon" },
            { value: "cal", label: "Cal" },
            { value: "done", label: "Done" },
          ]}
        />
      </div>

      {view === "today" && carried > 0 ? (
        <p className="mt-3 text-xs text-muted">
          {carried} carried forward from an earlier date — still due, not forgotten.
        </p>
      ) : null}

      {view !== "cal" && view !== "done" ? (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitQuick();
          }}
        >
          <Input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder={view === "inbox" ? "Add to inbox" : "Add a task for today"}
          />
          <Button type="submit" size="icon" aria-label="Add task">
            <Plus className="size-4" />
          </Button>
        </form>
      ) : null}

      {view === "cal" ? (
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-muted"
              onClick={() => setCalCursor(addDays(calCursor, -30))}
            >
              Prev
            </button>
            <p className="text-sm font-medium">
              {formatShortDate(calCursor.slice(0, 8) + "01")}
            </p>
            <button
              type="button"
              className="text-sm text-muted"
              onClick={() => setCalCursor(addDays(calCursor, 30))}
            >
              Next
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-faint">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={`${d}-${i}`} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const count = open.filter((t) => t.dueDate === day).length;
              const isToday = day === today;
              const inMonth = day.slice(0, 7) === calCursor.slice(0, 7);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setCalCursor(day)}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center rounded-xl text-xs",
                    isToday ? "bg-fg text-bg" : "bg-sunken",
                    !inMonth && "opacity-40",
                  )}
                >
                  {Number(day.slice(8))}
                  {count ? (
                    <span className={cn("mt-0.5 size-1 rounded-full", isToday ? "bg-bg" : "bg-primary")} />
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-muted">
            {formatShortDate(calCursor)}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {open.filter((t) => t.dueDate === calCursor).length === 0 ? (
              <p className="text-sm text-muted">Nothing assigned this day.</p>
            ) : (
              open
                .filter((t) => t.dueDate === calCursor)
                .sort(byPriority)
                .map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    project={projects.find((p) => p.id === t.projectId)?.name}
                    onToggle={() => toggleTask(t.id)}
                    onOpen={() => setEditing(t)}
                  />
                ))
            )}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const title = quick.trim();
              if (!title) return;
              addTask({ title, dueDate: calCursor, projectId: "inbox" });
              setQuick("");
            }}
          >
            <Input
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              placeholder={`Add for ${formatShortDate(calCursor)}`}
            />
            <Button type="submit" size="icon" aria-label="Add">
              <Plus className="size-4" />
            </Button>
          </form>
        </div>
      ) : list.length === 0 ? (
        <Card className="mt-4">
          <p className="font-medium">
            {view === "done" ? "No completed tasks yet." : "Clear."}
          </p>
          <p className="mt-1 text-sm text-muted">
            {view === "today"
              ? "Add something, or it will appear here when a due date arrives."
              : view === "inbox"
                ? "Inbox is for undated captures."
                : view === "soon"
                  ? "Upcoming dated work lives here."
                  : "Finished work stays for the record."}
          </p>
        </Card>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {list.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              project={projects.find((p) => p.id === t.projectId)?.name}
              onToggle={() => toggleTask(t.id)}
              onOpen={() => setEditing(t)}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? "Task" : undefined}
      >
        {editing ? (
          <div className="flex flex-col gap-3">
            <Input
              value={editing.title}
              onChange={(e) => {
                const next = { ...editing, title: e.target.value };
                setEditing(next);
                updateTask(editing.id, { title: e.target.value });
              }}
            />
            <Textarea
              value={editing.notes}
              onChange={(e) => {
                const next = { ...editing, notes: e.target.value };
                setEditing(next);
                updateTask(editing.id, { notes: e.target.value });
              }}
              placeholder="Notes"
            />
            <label className="text-sm text-muted">
              Due date
              <Input
                className="mt-1"
                type="date"
                value={editing.dueDate}
                onChange={(e) => {
                  const next = { ...editing, dueDate: e.target.value, carriedFrom: undefined };
                  setEditing(next);
                  updateTask(editing.id, { dueDate: e.target.value, carriedFrom: undefined });
                }}
              />
            </label>
            <label className="text-sm text-muted">
              Reminder
              <Input
                className="mt-1"
                type="time"
                value={editing.reminder}
                onChange={(e) => {
                  const next = { ...editing, reminder: e.target.value };
                  setEditing(next);
                  updateTask(editing.id, { reminder: e.target.value });
                }}
              />
            </label>
            <div>
              <p className="text-sm text-muted">Priority</p>
              <div className="mt-2 flex gap-2">
                {PRI.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      const next = { ...editing, priority: p };
                      setEditing(next);
                      updateTask(editing.id, { priority: p });
                    }}
                    className={cn(
                      "h-11 flex-1 rounded-xl text-sm font-medium",
                      editing.priority === p ? "bg-fg text-bg" : "bg-sunken text-muted",
                    )}
                  >
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>
            <label className="text-sm text-muted">
              Project
              <select
                className="mt-1 h-11 w-full rounded-xl bg-surface px-3 text-base text-fg shadow-card"
                value={editing.projectId}
                onChange={(e) => {
                  const next = { ...editing, projectId: e.target.value };
                  setEditing(next);
                  updateTask(editing.id, { projectId: e.target.value });
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted">
              Repeat
              <select
                className="mt-1 h-11 w-full rounded-xl bg-surface px-3 text-base text-fg shadow-card"
                value={editing.repeat}
                onChange={(e) => {
                  const repeat = e.target.value as TaskRepeat;
                  const next = { ...editing, repeat };
                  setEditing(next);
                  updateTask(editing.id, { repeat });
                }}
              >
                {REPEATS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => setEditing(null)}>
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  deleteTask(editing.id);
                  setEditing(null);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function byPriority(a: Task, b: Task) {
  return a.priority - b.priority || a.title.localeCompare(b.title);
}

function TaskRow({
  task,
  project,
  onToggle,
  onOpen,
}: {
  task: Task;
  project?: string;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const done = !!task.completedAt;
  return (
    <Card className="flex items-start gap-3">
      <button
        type="button"
        aria-label={done ? "Reopen" : "Complete"}
        onClick={onToggle}
        className={cn(
          "mt-0.5 grid size-11 shrink-0 place-items-center rounded-full",
          done ? "bg-primary text-primary-fg" : "bg-sunken text-muted",
        )}
      >
        <Check className="size-5" />
      </button>
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
        <p className={cn("font-medium", done && "text-muted line-through")}>{task.title}</p>
        <p className="mt-1 text-xs text-muted">
          <span className={priorityClass(task.priority)}>{PRIORITY_LABEL[task.priority]}</span>
          {project ? ` · ${project}` : ""}
          {task.dueDate ? ` · ${formatShortDate(task.dueDate)}` : " · no date"}
          {task.reminder ? ` · remind ${task.reminder}` : ""}
          {task.carriedFrom ? " · carried forward" : ""}
          {task.repeat !== "none" ? ` · ${task.repeat}` : ""}
          {task.dueDate && !done ? ` · ${hoursUntil(task.dueDate)}h` : ""}
        </p>
      </button>
      {task.dueDate ? <CalendarDays className="mt-2 size-4 shrink-0 text-faint" /> : null}
    </Card>
  );
}
