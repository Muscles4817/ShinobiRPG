import type { LedgerLine } from '@/systems/missions';

import type { DebriefLine } from './reports';

/**
 * The debrief told as a short paragraph rather than read back line by line. Ledger lines are
 * facts written without a subject ("Pulled a carter out of the ditch."); the narrator gives
 * them one ("You pulled…"), runs a few together into a sentence, and moves the story on between
 * sentences ("Then you…"), while lines with a subject of their own ("The client asked for you
 * by name.") stand as written. Each line stays its own fragment, so its pay chip sits beside
 * the words that earned it. Story text carries no numbers, and nothing here adds any.
 */

/** At most this many facts run together in one sentence. */
export const CLAUSES_PER_SENTENCE = 3;

/** How a sentence after the first moves the story on. */
const ONWARD = ['Then you', 'After that you', 'Later you'] as const;
/** The last sentence, when there were several. */
const LAST = 'In the end you';

/** Past tenses that don't end in -ed, as ledger lines start with them. */
const IRREGULAR = new Set(
  (
    'beat bit bought broke brought caught chose came did drew dug fell felt fought found gave ' +
    'got had heard held hid hung kept knew laid led left let lost made meant met paid ran read ' +
    'rode said sat saw sent set shut slept sold spoke split stood stole struck swore taught ' +
    'thought threw told took was went woke won wore wrote'
  ).split(' '),
);

/** Words ending in -ed that are not past tenses. */
const NOT_VERBS = new Set(['need', 'seed', 'speed', 'bleed', 'breed', 'shed', 'sled', 'embed']);

/** Whether a line opens on its verb, its subject understood to be you. */
export function subjectless(text: string): boolean {
  const first = /^[A-Za-z-]+/.exec(text)?.[0] ?? '';
  if (first !== first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()) return false;
  const word = first.toLowerCase();
  return IRREGULAR.has(word) || (/^[a-z-]{2,}ed$/.test(word) && !NOT_VERBS.has(word));
}

interface Fact {
  readonly line: LedgerLine;
  /** The first sentence, without its full stop. */
  readonly clause: string;
  /** Any sentences after the first, as written. */
  readonly rest: string;
  readonly mine: boolean;
}

function factOf(line: LedgerLine): Fact {
  const text = line.text.trim();
  const end = text.search(/[.!?](\s|$)/);
  const first = end < 0 ? text : text.slice(0, end);
  const rest = end < 0 ? '' : text.slice(end + 1).trim();
  return { line, clause: first, rest, mine: subjectless(text) };
}

/** A fact that can run on with others: yours, one sentence, no commas of its own. */
const joinable = (f: Fact) => f.mine && f.rest === '' && !f.clause.includes(',');

/** The facts in sentences: runs of joinable facts together, everything else alone. */
function sentencesOf(facts: readonly Fact[]): Fact[][] {
  const out: Fact[][] = [];
  for (const fact of facts) {
    const last = out.at(-1);
    const fits =
      last !== undefined &&
      joinable(fact) &&
      last.every(joinable) &&
      last.length < CLAUSES_PER_SENTENCE;
    if (fits) last.push(fact);
    else out.push([fact]);
  }
  return out;
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function fragment(fact: Fact, text: string): DebriefLine {
  const { line } = fact;
  return {
    text,
    tone: line.tone,
    pay: payChip(line.pay),
    ...(line.noted ? { noted: true as const } : {}),
  };
}

function payChip(share: number | undefined): string | null {
  if (share === undefined || share === 0) return null;
  return `${share > 0 ? '+' : '−'}${Math.round(Math.abs(share) * 100)}% pay`;
}

function opener(index: number, count: number): string {
  if (index === 0) return 'You';
  if (index === count - 1 && count > 2) return LAST;
  return ONWARD[(index - 1) % ONWARD.length] ?? 'Then you';
}

/** One sentence, as fragments: "You a," " b" " and c." */
function told(sentence: readonly Fact[], index: number, count: number): DebriefLine[] {
  const space = index === 0 ? '' : ' ';
  const [head] = sentence;
  if (sentence.length === 1 && head && !head.mine)
    return [fragment(head, space + head.line.text.trim())];
  return sentence.map((fact, i) => {
    const words = lowerFirst(fact.clause);
    const rest = fact.rest ? ` ${fact.rest}` : '';
    if (i === 0) {
      const stop = sentence.length === 1 ? `.${rest}` : '';
      return fragment(fact, `${space}${opener(index, count)} ${words}${stop}`);
    }
    if (i === sentence.length - 1) return fragment(fact, ` and ${words}.`);
    return fragment(fact, `, ${words}`);
  });
}

/** The ledger as a paragraph of fragments, each with the pay its line moved. */
export function debriefStory(ledger: readonly LedgerLine[]): DebriefLine[] {
  const sentences = sentencesOf(ledger.map(factOf));
  return sentences.flatMap((s, i) => told(s, i, sentences.length));
}
