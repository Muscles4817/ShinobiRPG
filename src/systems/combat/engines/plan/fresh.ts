import { freshIndex, hashString } from '@/core';

import { namedOf, voiceLine, voicesOf } from '../../rules/narration';
import { tell, type Cast, type Told } from '../../rules/telling';
import type { Round } from './state';

/**
 * Picking words with memory. A line is chosen from its bank by a hash of the moment (the
 * exchange, how far through it the log is, who acts), never by the fight's dice, so the same
 * fight always reads the same and words never change what happens; but a template used in the
 * last few lines is passed over (`freshIndex`), so "You search" doesn't come back three
 * exchanges running. Each told line carries which bank and template it came from (`voiceLine`),
 * which is all the memory there is. When the same fighter does the same thing again, a bank's
 * `again` lines say so ("You search again, and still find no one.").
 */

/** How far back the story remembers what it has said. */
export const RECENT_LINES = 6;

/** A moment in the log: where the pick hashes from, and the lines just said before it. */
export interface Moment {
  readonly key: string;
  readonly recent: readonly string[];
}

/** A moment in the log, the same each time for this place in this fight. */
export function momentOf(round: Round, who: string): Moment {
  const said = [...(round.recent ?? []), ...round.lines];
  return { key: `${round.number}:${round.lines.length}:${who}`, recent: said.slice(-RECENT_LINES) };
}

/** The same moment, for a second pick within it (a verb, a guard). */
export function within(moment: Moment, part: string): Moment {
  return { ...moment, key: `${moment.key}:${part}` };
}

/** A plain pick by the moment, with no memory: for words that aren't a whole template. */
export function pick<T>(moment: Moment, bank: readonly T[]): T {
  const line = bank[hashString(moment.key) % bank.length];
  if (line === undefined) throw new Error('A narration bank is empty');
  return line;
}

/** Lines that tell one kind of beat, and how to tell it when the same fighter repeats it. */
export interface Bank {
  readonly id: string;
  readonly lines: readonly string[];
  readonly again?: readonly string[];
}

function isTold(value: Cast[string] | undefined): value is Told {
  return typeof value === 'object' && !Array.isArray(value);
}

/** Who a beat is about: the actor, if the cast has one. */
function subjectOf(cast: Cast): Told | null {
  const a = cast.a;
  return isTold(a) ? a : null;
}

/** The same fighter did this same thing (with the same technique, if any) just now. */
function repeated(moment: Moment, bank: Bank, cast: Cast): boolean {
  const who = subjectOf(cast);
  if (!bank.again || !who) return false;
  const what = typeof cast.what === 'string' ? cast.what : null;
  // Once told as a repeat, a third time is a repeat too.
  const ids = [`${bank.id}.`, `${bank.id}-again.`];
  return moment.recent.some((line) => {
    const from = voicesOf(line).some((v) => ids.some((id) => v.startsWith(id)));
    return from && namedOf(line)[0] === who.id && (what === null || line.includes(what));
  });
}

/** Templates of this bank used in the moment's recent lines, by index, oldest first. */
function usedRecently(moment: Moment, id: string): number[] {
  const prefix = `${id}.`;
  return moment.recent.flatMap((line) =>
    voicesOf(line)
      .filter((v) => v.startsWith(prefix))
      .map((v) => Number(v.slice(prefix.length))),
  );
}

/**
 * A template of the bank not used lately, by the moment's hash; when every one has been, the
 * one used longest ago.
 */
export function freshPick(moment: Moment, id: string, size: number): number {
  const used = usedRecently(moment, id);
  if (new Set(used).size < size) return freshIndex(moment.key, size, used);
  const lastUse = (i: number) => used.lastIndexOf(i);
  return Array.from({ length: size }, (_, i) => i).reduce((a, b) =>
    lastUse(b) < lastUse(a) ? b : a,
  );
}

/** A fresh template from the bank, told with the cast and marked with where it came from. */
export function told(moment: Moment, bank: Bank, cast: Cast): string {
  const again = repeated(moment, bank, cast) && bank.again ? bank.again : null;
  const id = again ? `${bank.id}-again` : bank.id;
  const lines = again ?? bank.lines;
  const index = freshPick(moment, id, lines.length);
  const template = lines[index];
  if (template === undefined) throw new Error(`Narration bank ${bank.id} is empty`);
  return voiceLine(tell(template, cast), `${id}.${index}`);
}

/** A fresh word from a bank of words (a verb), marked so it rests a while once used. */
export function freshWord(moment: Moment, bank: Bank): { word: string; mark: string } {
  const index = freshPick(moment, bank.id, bank.lines.length);
  return { word: bank.lines[index] ?? bank.lines[0] ?? '', mark: `${bank.id}.${index}` };
}
