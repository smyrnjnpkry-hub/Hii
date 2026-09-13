# SPIRE

A daily companion for wholebeing — five colors, not the sun. Interactive habit building from tiny if-then votes, not streaks-as-shame.

Inspired by Tal Ben-Shahar’s SPIRE / Wholebeing model: Spiritual, Physical, Intellectual, Relational, Emotional.

## Run

```bash
npm install
npm run dev
```

App listens on port 8080.

## Habit play

- **Today’s votes** — a ring for habits cued today, plus a seven-day chain
- **Two-minute start** — stay with the tiny act after the cue; mark it done when the timer ends
- **Never miss twice** — a recovery start if the last scheduled day slipped
- **If-then builder** — After I [routine], in [place], I will [tiny act]
- **Four-week heatmap** — scheduled days only; missing a day does not reset automaticity
- Cap of three live habits. Depth over collection.

## Also in the prism

- Timed routines with a run player
- Tasks with carry-forward
- Five-color check-in and radar
- Journal, Week OS (three MITs), Unlearn (urge surf + competing response)
- Skill studio, agency, cognitive-health stack

## Tech

TanStack Start (React 19, Vite), Tailwind v4, Zustand persist, Web Speech for routine cues.
