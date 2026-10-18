/**
 * Measures of the machine voice (`docs/design/prose-plan.md`): how long sentences run, how much
 * speech is a string of quips, how many beats end on a button, and counts of the habits that
 * give generated prose away. Pure functions over text, so the same numbers come from goldens
 * and from a pack's strings.
 */

/** A count of a habit, per thousand words so different bodies of text compare. */
export interface StyleReport {
  readonly words: number;
  readonly sentences: number;
  /** Mean words per sentence (human fiction runs about fifteen). */
  readonly meanSentence: number;
  /** Share of sentences of four words or fewer. */
  readonly shortShare: number;
  /** Share of spoken sentences that are short and impersonal: the quip. */
  readonly quipShare: number;
  /** Per thousand words. */
  readonly per1k: Readonly<Record<Habit, number>>;
}

const HABITS = {
  /** A gesture between lines of speech, as punctuation. */
  gesture:
    /\b(nods?|shrugs?|grins?|smirks?|sighs?|winks?|almost smiles?|says nothing|a long (moment|time))\b/gi,
  /** "A, B and C". */
  triple: /\b\w+(?: \w+)?, \w+(?: \w+)?,? and \w+/g,
  /** A colon joining two halves of a story sentence. */
  colon: /[a-z’]: [a-z]/g,
  vagueSomething: /\bsomething\b/gi,
  stockAtmosphere:
    /\b(whisper\w*|flicker\w*|glint\w*|firelight|lamplight|woodsmoke|shimmer\w*|glow\w*)\b/gi,
  /** "It isn't X. It's Y." and its kin. */
  notButReversal: /\b(?:isn’t|wasn’t|not)\b[^.”]{1,40}\. (?:It’s|It is|That’s|They’re)\b/g,
  emDash: /—/g,
} as const;
export type Habit = keyof typeof HABITS;
export const STYLE_HABITS = Object.keys(HABITS) as readonly Habit[];

/** A beat whose last sentence is five words or fewer, after a longer one: the button. */
export function endsOnButton(text: string): boolean {
  const sentences = sentencesOf(text);
  const last = sentences.at(-1);
  return sentences.length >= 2 && last !== undefined && wordCount(last) <= 5;
}

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

function sentencesOf(text: string): string[] {
  return text
    .replace(/[“”]/g, '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => wordCount(s) > 0);
}

const IMPERSONAL = /\b(I|me|my|you|your|we|us|our)\b/i;

function quips(texts: readonly string[]): { spoken: number; quips: number } {
  const spoken = texts.flatMap((t) =>
    (t.match(/“[^”]+”/g) ?? []).flatMap((q) => sentencesOf(q.slice(1, -1))),
  );
  const short = spoken.filter((s) => wordCount(s) <= 6 && s.endsWith('.') && !IMPERSONAL.test(s));
  return { spoken: spoken.length, quips: short.length };
}

export function styleOf(texts: readonly string[]): StyleReport {
  const all = texts.join('\n');
  const words = wordCount(all);
  const lengths = texts.flatMap(sentencesOf).map(wordCount);
  const { spoken, quips: quipCount } = quips(texts);
  const per = (n: number) => Math.round((n / Math.max(words, 1)) * 10000) / 10;
  const per1k = Object.fromEntries(
    STYLE_HABITS.map((h) => [h, per((all.match(HABITS[h]) ?? []).length)]),
  ) as Record<Habit, number>;
  return {
    words,
    sentences: lengths.length,
    meanSentence:
      Math.round((lengths.reduce((a, b) => a + b, 0) / Math.max(lengths.length, 1)) * 10) / 10,
    shortShare: share(lengths.filter((n) => n <= 4).length, lengths.length),
    quipShare: share(quipCount, spoken),
    per1k,
  };
}

const share = (n: number, of: number) => Math.round((n / Math.max(of, 1)) * 100) / 100;

/** Every string in a content tree that reads as prose: three words or more, with a lowercase letter. */
export function proseIn(root: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<object>();
  const visit = (value: unknown): void => {
    if (typeof value === 'string') {
      if (wordCount(value) >= 3 && /[a-z]/.test(value)) out.push(value);
      return;
    }
    if (typeof value !== 'object' || value === null || seen.has(value)) return;
    seen.add(value);
    for (const v of Array.isArray(value) ? value : Object.values(value)) visit(v);
  };
  visit(root);
  return out;
}
