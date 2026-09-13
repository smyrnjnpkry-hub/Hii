import { Button, Card, Textarea } from "@/components/ui";
import { JOURNAL_TEMPLATES, PILLAR_META } from "@/lib/pillars";
import { useStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/journal")({ component: JournalPage });

function JournalPage() {
  const entries = useStore((s) => s.journal);
  const add = useStore((s) => s.addJournal);
  const remove = useStore((s) => s.deleteJournal);
  const [template, setTemplate] = useState(JOURNAL_TEMPLATES[0].id);
  const [body, setBody] = useState("");
  const t = JOURNAL_TEMPLATES.find((x) => x.id === template) ?? JOURNAL_TEMPLATES[0];

  return (
    <div className="px-4 pb-28 pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Journal</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Put it down.</h1>
      <p className="mt-2 text-sm text-muted">
        Feelings are allowed here. Forced positivity is a pitfall, not a practice.
      </p>

      <div className="mt-4 overflow-x-auto">
        <div className="flex w-max gap-1.5">
          {JOURNAL_TEMPLATES.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setTemplate(x.id)}
              className={
                "h-9 rounded-full px-3 text-xs font-medium " +
                (template === x.id ? "bg-fg text-bg" : "bg-sunken text-muted")
              }
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">{t.prompt}</p>
      <Textarea
        className="mt-2"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write in sentences, not slogans."
      />
      <Button
        className="mt-3 w-full"
        disabled={!body.trim()}
        onClick={() => {
          add(template, body.trim());
          setBody("");
        }}
      >
        Keep
      </Button>

      <div className="mt-6 flex flex-col gap-2">
        {entries.length === 0 ? (
          <p className="text-sm text-muted">No pages yet. One true sentence is a start.</p>
        ) : (
          entries.map((e) => (
            <Card key={e.id}>
              <p className="text-xs text-muted">
                {formatShortDate(e.date)} ·{" "}
                {JOURNAL_TEMPLATES.find((x) => x.id === e.template)?.label ?? e.template}
                {e.pillar ? ` · ${PILLAR_META[e.pillar].label}` : ""}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{e.body}</p>
              <button
                type="button"
                className="mt-2 text-xs text-muted underline"
                onClick={() => remove(e.id)}
              >
                Remove
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
