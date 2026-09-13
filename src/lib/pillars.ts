import type { Domain, Pillar, Scores } from "./types";

export const PILLAR_META: Record<
  Pillar,
  { letter: string; label: string; short: string; definition: string; color: string }
> = {
  spiritual: {
    letter: "S",
    label: "Spiritual",
    short: "Meaning + presence",
    definition:
      "Leading a meaningful life and mindfully savoring the present. Purpose + presence. Not required to be religious. Turn ordinary moments into meaningful ones. See work as a calling, not only a job.",
    color: "var(--color-spiritual)",
  },
  physical: {
    letter: "P",
    label: "Physical",
    short: "Body + recovery",
    definition:
      "Caring for the body and the mind–body connection. Movement, real food, sleep, recovery, touch. Stress is not the enemy; lack of recovery is. Micro (breath), mid (walk), macro (real time off).",
    color: "var(--color-physical)",
  },
  intellectual: {
    letter: "I",
    label: "Intellectual",
    short: "Curiosity + depth",
    definition:
      "Engaging in deep learning and opening to experience. Curiosity over credentials. Ask questions. Stay with a text, artwork, idea, or patch of nature long enough to actually see it.",
    color: "var(--color-intellectual)",
  },
  relational: {
    letter: "R",
    label: "Relational",
    short: "Self + others",
    definition:
      "Nurturing a constructive relationship with self and others. Quality of close relationships is the strongest long-run predictor of happiness. Giving, listening, micro-moments. Give to yourself so you can keep giving.",
    color: "var(--color-relational)",
  },
  emotional: {
    letter: "E",
    label: "Emotional",
    short: "Feel + allow",
    definition:
      "Feeling all emotions and reaching toward resilience and positivity. Cultivate gratitude and joy. Allow envy, sorrow, fear without drowning in them. You can feel sad and still take a walk.",
    color: "var(--color-emotional)",
  },
};

export const DOMAIN_META: Record<Domain, { label: string; hint: string }> = {
  body: { label: "Sleep / Body", hint: "Energy first" },
  craft: { label: "Craft / Work", hint: "The work that is yours" },
  mind: { label: "Mind / Learning", hint: "Stay with one idea" },
  people: { label: "People", hint: "One real contact" },
  admin: { label: "Money / Admin", hint: "Open loops, not work" },
  play: { label: "Play / Recovery", hint: "Not earned. Required." },
};

export interface SeedAction {
  id: string;
  pillar: Pillar;
  title: string;
  detail: string;
  minutes: number;
  kind: "mvi" | "micro";
}

export const MVI_LIBRARY: SeedAction[] = [
  { id: "mvi-breath", pillar: "physical", title: "Three breaths", detail: "In for four, out for six. Three times. That is enough.", minutes: 1, kind: "mvi" },
  { id: "mvi-gratitude", pillar: "emotional", title: "Five gratitudes", detail: "Name five specific things, out loud or on paper. Not 'family' — a detail.", minutes: 2, kind: "mvi" },
  { id: "mvi-quote", pillar: "intellectual", title: "Read a line slowly", detail: "One sentence. Twice. Let it land before you move.", minutes: 1, kind: "mvi" },
  { id: "mvi-stairs", pillar: "physical", title: "Forty-five seconds of stairs", detail: "Or march in place. Get slightly out of breath.", minutes: 1, kind: "mvi" },
  { id: "mvi-thinking", pillar: "relational", title: "One 'thinking of you'", detail: "A short message. No agenda. Presence is the gift.", minutes: 2, kind: "mvi" },
  { id: "mvi-name", pillar: "emotional", title: "Name the feeling", detail: "Anxious, bored, sad, restless, glad. Naming reduces the flood.", minutes: 1, kind: "mvi" },
  { id: "mvi-awe", pillar: "spiritual", title: "Twenty seconds of awe", detail: "Sky, a tree, a child's drawing, steam from a cup. Stay.", minutes: 1, kind: "mvi" },
  { id: "mvi-water", pillar: "physical", title: "Water and stand", detail: "Drink a glass. Stand up. Look farther than the screen.", minutes: 1, kind: "mvi" },
  { id: "mvi-phone", pillar: "relational", title: "Phone down, look", detail: "At a person if one is there. At a window if not.", minutes: 1, kind: "mvi" },
];

export const MICRO_LIBRARY: SeedAction[] = [
  { id: "s-presence", pillar: "spiritual", title: "Three minutes of presence", detail: "Sit. Feel the breath. When the mind wanders, return. No score.", minutes: 3, kind: "micro" },
  { id: "s-meaning", pillar: "spiritual", title: "Meaning note", detail: "One sentence: why today is for something larger than the inbox.", minutes: 2, kind: "micro" },
  { id: "s-calling", pillar: "spiritual", title: "Calling 5%", detail: "Do the 5% of your work that feels like a calling, first.", minutes: 15, kind: "micro" },
  { id: "s-values", pillar: "spiritual", title: "Values check", detail: "Did this morning honor one of your three values? Yes or redesign.", minutes: 3, kind: "micro" },
  { id: "s-offphone", pillar: "spiritual", title: "Fifteen minutes off-phone", detail: "Phone in another room. You get your attention back.", minutes: 15, kind: "micro" },
  { id: "p-walk", pillar: "physical", title: "Ten-minute walk", detail: "Outside if you can. Slightly out of breath is brain fertilizer.", minutes: 10, kind: "micro" },
  { id: "p-wind", pillar: "physical", title: "Sleep wind-down", detail: "Dim lights, same cue, same hour. Recovery is the training.", minutes: 15, kind: "micro" },
  { id: "p-food", pillar: "physical", title: "Whole-food swap", detail: "One real thing: fruit, nuts, leftover vegetables. Not a diet overhaul.", minutes: 5, kind: "micro" },
  { id: "p-stretch", pillar: "physical", title: "Stretch after sitting", detail: "Stand, roll shoulders, touch toes or not. Two minutes.", minutes: 2, kind: "micro" },
  { id: "p-snack", pillar: "physical", title: "Three-minute movement snack", detail: "Squats, a wall push-up, a dance. Micro recovery.", minutes: 3, kind: "micro" },
  { id: "i-read", pillar: "intellectual", title: "Twenty minutes of deep reading", detail: "A book, a paper, a score. Phone in another room.", minutes: 20, kind: "micro" },
  { id: "i-question", pillar: "intellectual", title: "One genuine question", detail: "Write it. Do not google yet. Stay curious for ten minutes.", minutes: 10, kind: "micro" },
  { id: "i-tell", pillar: "intellectual", title: "Learn and tell", detail: "Teach one thing you learned to a person or to the page.", minutes: 8, kind: "micro" },
  { id: "i-savor", pillar: "intellectual", title: "Savor art or nature", detail: "One painting, one tree, one piece of music. Stay until you see more.", minutes: 10, kind: "micro" },
  { id: "i-reread", pillar: "intellectual", title: "Re-read one page slowly", detail: "The same page. Depth over coverage.", minutes: 8, kind: "micro" },
  { id: "r-undistracted", pillar: "relational", title: "Ten undistracted minutes", detail: "With someone. Phone away. Or a kind letter to yourself.", minutes: 10, kind: "micro" },
  { id: "r-text", pillar: "relational", title: "Check-in text", detail: "How are you, really. Then wait.", minutes: 3, kind: "micro" },
  { id: "r-meal", pillar: "relational", title: "A meal without a phone", detail: "Taste it. If you eat with someone, look at them.", minutes: 20, kind: "micro" },
  { id: "r-thanks", pillar: "relational", title: "A specific thank-you", detail: "Name the act, not the person as a type.", minutes: 4, kind: "micro" },
  { id: "r-selffull", pillar: "relational", title: "Self-fullness pause", detail: "Give yourself ten quiet minutes so you can keep giving.", minutes: 10, kind: "micro" },
  { id: "e-five", pillar: "emotional", title: "Three good things", detail: "Write them. Why they happened. Emmons-style, specific.", minutes: 5, kind: "micro" },
  { id: "e-allow", pillar: "emotional", title: "Allow the feeling, sixty seconds", detail: "Do not fix it. Locate it in the body. Breathe around it.", minutes: 1, kind: "micro" },
  { id: "e-savor", pillar: "emotional", title: "Savor a small joy", detail: "Stretch the good by ten extra seconds. That is the practice.", minutes: 2, kind: "micro" },
  { id: "e-walksad", pillar: "emotional", title: "Sad, and still a walk", detail: "Permission first. Then shoes. Feelings are allowed on the path.", minutes: 10, kind: "micro" },
];

export const LESSONS: Record<
  Pillar | "spire",
  { title: string; minutes: string; body: string[]; pitfall: string }
> = {
  spire: {
    title: "The prism, not the sun",
    minutes: "1 min",
    body: [
      "Happiness is like staring at the sun — vital, and harmful if you look at it directly. SPIRE is the prism. Look at the five colors instead.",
      "Wholebeing is Spiritual, Physical, Intellectual, Relational, Emotional. Directly chasing 'I want to be happy' often backfires (Mauss et al., 2011).",
      "There is no finish line. Happiness lives on a continuum. Small is enough: reminders, repetitions, rituals.",
    ],
    pitfall: "Do not grade yourself on a happiness score. Cultivate the elements; well-being can emerge.",
  },
  spiritual: {
    title: "Purpose and presence",
    minutes: "3 min",
    body: [
      "Spiritual here is not a creed. It is meaning plus the capacity to savor this moment.",
      "Work can be a job, a career, or a calling. The same hours feel different when they serve something you would still choose.",
      "Ordinary minutes become spiritual when you are actually in them: washing a cup, walking a corridor, hearing a voice.",
    ],
    pitfall: "Meaning-hunting. You do not need a grand purpose by Friday. One meaningful minute is the practice.",
  },
  physical: {
    title: "Recovery is the point",
    minutes: "3 min",
    body: [
      "The body is not a machine to optimize. It is the ground of every other pillar.",
      "Stress is not the enemy. Lack of recovery is. Micro: a breath. Mid: a walk or nap. Macro: a weekend that is actually off.",
      "Movement that gets you slightly out of breath feeds the brain (BDNF). Sleep of 7–9 hours is when memory and mood are rebuilt.",
    ],
    pitfall: "Heroic workouts with no recovery. The smallest recovered session beats the abandoned overhaul.",
  },
  intellectual: {
    title: "Stay long enough to see",
    minutes: "3 min",
    body: [
      "Curiosity is the engine, not credentials. Ask a real question and do not rush the answer.",
      "Depth: stay with a page, a painting, an idea, or a patch of nature until something new appears.",
      "Hard learning builds cognitive reserve. Passive scrolling does not. Fifteen focused minutes count.",
    ],
    pitfall: "Collecting facts without attention. Coverage is not the same as seeing.",
  },
  relational: {
    title: "The long study",
    minutes: "3 min",
    body: [
      "The Harvard Study of Adult Development found that the quality of close relationships is the strongest long-run predictor of happiness and health.",
      "Micro-moments: a look, a text without an ask, ten undistracted minutes. Generosity includes self-fullness — give to yourself so you can keep giving.",
      "The relationship with yourself is in the same pillar. Speak to yourself the way you would to a friend who is trying.",
    ],
    pitfall: "Performing connection (likes, streaks) instead of being with one person.",
  },
  emotional: {
    title: "Feel it, then take a walk",
    minutes: "3 min",
    body: [
      "Emotional health is not forced positivity. It is the permission to feel envy, sorrow, and fear without drowning in them — and still move toward gratitude and joy.",
      "You can feel sad and still take a walk. That is Ben-Shahar's line, and it is the whole method.",
      "Gratitude works when it is specific (Emmons). Three good things, written, with why they happened.",
    ],
    pitfall: "Forced positivity. It does not heal; it hides. Allow first. Cultivate second.",
  },
};

export const JOURNAL_TEMPLATES = [
  { id: "free", label: "Free write", prompt: "Whatever is here." },
  { id: "meaning", label: "Meaning", prompt: "What felt like it mattered today, even a little?" },
  { id: "body", label: "Body", prompt: "What does the body need: movement, food, sleep, or recovery?" },
  { id: "curiosity", label: "Curiosity", prompt: "What question is alive in you? Stay with it." },
  { id: "relationship", label: "Relationship", prompt: "Who did you really see, or who needs to be seen?" },
  { id: "good", label: "Three good things", prompt: "Three specific good things, and why they happened." },
  { id: "calling", label: "Calling", prompt: "If this work were a calling, what 5% would you do first?" },
  { id: "feel", label: "Name the feeling", prompt: "Name it. Where is it in the body. What does it need that is small." },
];

export const HARD_STAIRS = [
  { id: "meaning", pillar: "spiritual" as Pillar, title: "A scrap of meaning", ask: "What still matters, even now? One sentence." },
  { id: "body", pillar: "physical" as Pillar, title: "A body need", ask: "Water, food, a stretch, a nap, a walk. What does the body ask?" },
  { id: "learned", pillar: "intellectual" as Pillar, title: "One thing learned", ask: "Difficulty is information. What did today teach?" },
  { id: "person", pillar: "relational" as Pillar, title: "One person", ask: "Who can you tell a true sentence to — including yourself?" },
  { id: "permit", pillar: "emotional" as Pillar, title: "Permission to feel", ask: "Name the hard feeling. You do not have to fix it to be allowed to have it." },
];

export const STALL_FEELINGS = [
  "anxious",
  "bored",
  "ashamed",
  "unclear",
  "tired",
  "resentful",
  "afraid",
  "scattered",
];

export const START_REWARDS = [
  "Tea after",
  "One song after",
  "A five-minute walk after",
  "Sunlight at the window after",
  "Nothing — the start is the reward",
];

export const VALUE_OPTIONS = [
  "Health",
  "Craft",
  "Family",
  "Learning",
  "Honesty",
  "Stewardship",
  "Play",
  "Service",
  "Freedom",
  "Mastery",
];

export function lowestPillar(scores: Scores | null): Pillar {
  if (!scores) return "physical";
  let min: Pillar = "spiritual";
  let v = 99;
  (Object.keys(scores) as Pillar[]).forEach((p) => {
    if (scores[p] < v) {
      v = scores[p];
      min = p;
    }
  });
  return min;
}

export function mviFor(pillar: Pillar, hard: boolean): SeedAction {
  const pool = MVI_LIBRARY.filter((m) => m.pillar === pillar);
  const pick = pool[0] ?? MVI_LIBRARY[0];
  if (!hard) return pick;
  return { ...pick, minutes: 1, detail: "Hard season: even smaller. " + pick.detail };
}
