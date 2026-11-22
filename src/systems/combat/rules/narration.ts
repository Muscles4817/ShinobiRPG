/**
 * Writing a line of fight narration, and reading it into the event it tells (`storyContract.ts`).
 * Story text never shows numbers, and a line knows more than its words say: the harm or healing
 * it reports, the defences that reacted (and whose), why it went as it did, whom it names, which
 * bank its words came from, and whether it is a read the player's fighter made. Engines write
 * those with the helpers here as they compose a line; the one writer of an engine's story turns
 * the finished line into a `told` event with `toldFrom`, and from then on every reader reads the
 * event's fields. How a line carries them on the way is this module's own business: no other
 * module may read it (the lint rule on `⟦`).
 */

import { capitalise, listed, numberWord, ordinalWord, plural } from '@/core';

import {
  NARRATION_REACTIONS,
  type NarrationAmount,
  type NarrationReaction,
  type ToldEvent,
  type ToldReaction,
} from '../storyContract';
import { causeIn } from './causes';

export {
  NARRATION_OFF_PLAN,
  NARRATION_REACTIONS,
  type NarrationAmount,
  type NarrationAmountKind,
  type NarrationForce,
  type NarrationOffPlan,
  type NarrationReaction,
} from '../storyContract';

const AMOUNT_MARKER = /\s*⟦([+-])(\d+)⟧/g;
const REACTION_MARKER = /\s*⟦r:([a-z-]+)(?:\|([^|⟧]*)\|([^⟧]*))?⟧/g;
const READ_MARKER = /\s*⟦rd⟧/;
const NAMED_MARKER = /\s*⟦n:([^⟧]+)⟧/g;
const VOICE_MARKER = /\s*⟦v:([^⟧]+)⟧/g;
/** Anything a line carries beside its words, for stripping what a reader doesn't know. */
const ANY_MARKER = /\s*⟦[^⟧]*⟧/g;

function isReaction(word: string | undefined): word is NarrationReaction {
  return NARRATION_REACTIONS.some((r) => r === word);
}

/** "Goro lands a blow on Aoi." with 7 damage dealt. */
export function harmLine(text: string, damage: number): string {
  return `${text} ⟦-${damage}⟧`;
}

/** "Aoi recovers." with 12 health restored. */
export function healLine(text: string, healed: number): string {
  return `${text} ⟦+${healed}⟧`;
}

/** Who kept a defence (`by`) and whose attack it met (`on`). */
export interface Defending {
  readonly by?: string;
  readonly on?: string;
}

/** "Shun slips past the bandit's strike." when Shun's Dodge did it, against the bandit. */
export function reactionLine(
  text: string,
  { by, on }: Defending,
  ...reactions: readonly NarrationReaction[]
): string {
  return [text, ...reactions.map((r) => `⟦r:${r}|${by ?? ''}|${on ?? ''}⟧`)].join(' ');
}

/** A read the player's fighter makes of a foe: what they noticed, said as surely as they can tell. */
export function readLine(text: string): string {
  return `${text} ⟦rd⟧`;
}

/**
 * A line that names these fighters (by id), in the order it names them: the story may call
 * them "you" or "the first thug", so the screen can't find them by name.
 */
export function namedLine(text: string, ids: readonly string[]): string {
  return ids.length === 0 ? text : `${text} ⟦n:${ids.join('|')}⟧`;
}

/**
 * A line whose words came from these templates ("search.2"), so the engine can remember what
 * it said lately and pass over it.
 */
export function voiceLine(text: string, ...voices: readonly string[]): string {
  return [text, ...voices.map((v) => `⟦v:${v}⟧`)].join(' ');
}

/** A line's words alone, as a reader sees them. */
export function plainText(line: string): string {
  return line.includes('⟦') ? line.replace(ANY_MARKER, '') : line;
}

function reactionsIn(line: string): ToldReaction[] {
  return [...line.matchAll(REACTION_MARKER)].flatMap((m): ToldReaction[] => {
    const reaction = m[1];
    if (!isReaction(reaction)) return [];
    return [{ reaction, ...(m[2] ? { by: m[2] } : {}), ...(m[3] ? { on: m[3] } : {}) }];
  });
}

function amountsIn(line: string): NarrationAmount[] {
  return [...line.matchAll(AMOUNT_MARKER)].map((m) => ({
    kind: m[1] === '+' ? 'heal' : 'harm',
    amount: Number(m[2]),
  }));
}

function listIn(line: string, marker: RegExp, split: boolean): string[] {
  return [...line.matchAll(marker)].flatMap((m) =>
    split ? (m[1] ?? '').split('|') : [m[1] ?? ''],
  );
}

/** What a finished line tells: its words, and everything written beside them. */
export function toldFrom(line: string): ToldEvent {
  if (!line.includes('⟦')) return { kind: 'told', text: line };
  const amounts = amountsIn(line);
  const reactions = reactionsIn(line);
  const named = listIn(line, NAMED_MARKER, true);
  const voices = listIn(line, VOICE_MARKER, false);
  return {
    kind: 'told',
    text: plainText(line),
    ...(named.length > 0 ? { named } : {}),
    ...(voices.length > 0 ? { voices } : {}),
    ...(amounts.length > 0 ? { amounts } : {}),
    ...(reactions.length > 0 ? { reactions } : {}),
    ...causeIn(line),
    ...(READ_MARKER.test(line) ? { read: true as const } : {}),
  };
}

interface Named {
  readonly name: string;
  readonly called?: string;
}

/** "the bandit thug" as the second of two: "the second bandit thug". */
function nthCalled(called: string | undefined, nth: number): string | undefined {
  if (!called?.startsWith('the ')) return called;
  return `the ${ordinalWord(nth)} ${called.slice('the '.length)}`;
}

/**
 * Fighters who share a name ("Hungry Ghost" twice) are numbered in the order they stand
 * ("Hungry Ghost 1", "Hungry Ghost 2") on their banners, and told apart in the story the same
 * way ("the first hungry ghost"). A name nobody shares is left as it is.
 */
export function numberedNames<T extends Named>(fighters: readonly T[]): T[] {
  const count = (name: string) => fighters.filter((f) => f.name === name).length;
  return fighters.map((f, i) => {
    if (count(f.name) < 2) return f;
    const nth = fighters.slice(0, i + 1).filter((o) => o.name === f.name).length;
    const called = nthCalled(f.called, nth);
    return { ...f, name: `${f.name} ${nth}`, ...(called ? { called } : {}) };
  });
}

/** Several who share a name, in a few words: "two bandit thugs". */
function crowd(f: Named, count: number): string {
  if (count === 1) return f.called ?? f.name;
  const noun = f.called?.startsWith('the ') ? f.called.slice('the '.length) : f.name;
  return `${numberWord(count)} ${plural(noun)}`;
}

/** The opening line: "The storehouse wraith squares up", "Two bandit thugs square up". */
export function squareUpLine(foes: readonly Named[]): string {
  const names = [...new Set(foes.map((f) => f.name))];
  const words = names.map((name) => {
    const alike = foes.filter((f) => f.name === name);
    return alike[0] ? crowd(alike[0], alike.length) : name;
  });
  return capitalise(`${listed(words)} ${foes.length === 1 ? 'squares' : 'square'} up.`);
}
