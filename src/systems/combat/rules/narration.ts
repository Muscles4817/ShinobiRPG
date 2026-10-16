/**
 * Amounts and reactions in fight narration. Story text never shows numbers (the fight screen
 * shows them as chips), so a line that reports damage or healing carries its amount in a
 * marker: engines write it with `harmLine`/`healLine`. A line where a defence reacted (a
 * Dodge, a Guard, a Counter, a substitution) carries that too, via `reactionLine`, so the
 * screen can show the defence at work whoever acted first. A line written during a fighter's
 * turn says whose turn it was (and, if the turn moved the fight, the new distance) via
 * `turnLine`, so the screen can stage it, and how big the turn was (`forceLine`: its maker's
 * grade in the art, the ground an area covered, its element), so the screen can make a jōnin's
 * fire sound like one. `splitNarration` reads all of it back out of the sentence. Lines without a marker (older saves) pass through unchanged.
 */

import { AREA_SIZES, ELEMENTS, type AreaSize, type Element } from '@/systems/techniques';

import type { RangeBand } from '../contract';

export type NarrationAmountKind = 'harm' | 'heal';

export interface NarrationAmount {
  readonly kind: NarrationAmountKind;
  readonly amount: number;
}

/** What a slotted defence did about a blow. */
export const NARRATION_REACTIONS = [
  'dodged',
  'dodge-missed',
  'guarded',
  'guard-broken',
  'countered',
  'swapped',
] as const;
export type NarrationReaction = (typeof NARRATION_REACTIONS)[number];

export interface Narration {
  readonly text: string;
  readonly amounts: readonly NarrationAmount[];
  readonly reactions: readonly NarrationReaction[];
  /** Whose turn the line was written in (a combatant id), when an engine says. */
  readonly actorId?: string;
  /** The distance the fight stands at as of this line, when the engine says. */
  readonly range?: RangeBand;
  /** How big the turn it was written in was, when the engine says. */
  readonly force?: NarrationForce;
}

/** How big a turn was: its maker's grade in the art (0 for E up to 5 for S), area, element. */
export interface NarrationForce {
  readonly grade: number;
  readonly size: AreaSize | null;
  readonly element: Element | null;
}

const FORCE_MARKER = /\s*⟦fx:(\d):([a-z-]+):([a-z-]+)⟧/;
const NONE = '-';

const MARKER = /\s*⟦([+-])(\d+)⟧/g;
const REACTION_MARKER = /\s*⟦r:([a-z-]+)⟧/g;
const ACTOR_MARKER = /\s*⟦by:([^⟧]+)⟧/;
const RANGE_MARKER = /\s*⟦at:(close|mid|far)⟧/;

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

/** "Shun slips past the bandit's strike." when Shun's Dodge did it. */
export function reactionLine(text: string, ...reactions: readonly NarrationReaction[]): string {
  return [text, ...reactions.map((r) => `⟦r:${r}⟧`)].join(' ');
}

/**
 * A line written in `actorId`'s turn; `range` is where the fight stands as of it, if said. A
 * line already given to someone keeps them: one fighter may act inside another's turn (a
 * holder firing on someone closing in).
 */
export function turnLine(text: string, actorId: string, range?: RangeBand): string {
  const owner = ACTOR_MARKER.test(text) ? '' : ` ⟦by:${actorId}⟧`;
  return `${text}${owner}${range ? ` ⟦at:${range}⟧` : ''}`;
}

/** A line from a turn of this size; a line that already says its size keeps it. */
export function forceLine(text: string, force: NarrationForce): string {
  if (FORCE_MARKER.test(text)) return text;
  return `${text} ⟦fx:${force.grade}:${force.size ?? NONE}:${force.element ?? NONE}⟧`;
}

function forceOf(line: string): NarrationForce | null {
  const found = FORCE_MARKER.exec(line);
  if (!found) return null;
  const size = AREA_SIZES.find((s) => s === found[2]) ?? null;
  const element = ELEMENTS.find((e) => e === found[3]) ?? null;
  return { grade: Number(found[1]), size, element };
}

function isRange(word: string | undefined): word is RangeBand {
  return word === 'close' || word === 'mid' || word === 'far';
}

export function splitNarration(line: string): Narration {
  const amounts = [...line.matchAll(MARKER)].map((m): NarrationAmount => ({
    kind: m[1] === '+' ? 'heal' : 'harm',
    amount: Number(m[2]),
  }));
  const reactions = [...line.matchAll(REACTION_MARKER)].map((m) => m[1]).filter(isReaction);
  const actorId = ACTOR_MARKER.exec(line)?.[1];
  const range = RANGE_MARKER.exec(line)?.[1];
  const force = forceOf(line);
  const text = [MARKER, REACTION_MARKER, ACTOR_MARKER, RANGE_MARKER, FORCE_MARKER].reduce(
    (rest, marker) => rest.replace(marker, ''),
    line,
  );
  return {
    text,
    amounts,
    reactions,
    ...(actorId ? { actorId } : {}),
    ...(isRange(range) ? { range } : {}),
    ...(force ? { force } : {}),
  };
}

/**
 * Fighters who share a name ("Hungry Ghost" twice) are numbered in the order they stand
 * ("Hungry Ghost 1", "Hungry Ghost 2"), so the fight screen and every line about them can tell
 * them apart. A name nobody shares is left as it is.
 */
export function numberedNames<T extends { readonly name: string }>(fighters: readonly T[]): T[] {
  const count = (name: string) => fighters.filter((f) => f.name === name).length;
  return fighters.map((f, i) => {
    if (count(f.name) < 2) return f;
    const nth = fighters.slice(0, i + 1).filter((o) => o.name === f.name).length;
    return { ...f, name: `${f.name} ${nth}` };
  });
}

/** The opening line: "The bandit squares up", "Bandit, Archer square up". */
export function squareUpLine(names: readonly string[]): string {
  return `${names.join(', ')} ${names.length === 1 ? 'squares' : 'square'} up.`;
}
