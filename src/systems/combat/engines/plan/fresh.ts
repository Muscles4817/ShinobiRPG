import { freshIndex, hashString } from '@/core';

import { namedOf, voiceLine, voicesOf } from '../../rules/narration';
import { tell, type Cast, type Told } from '../../rules/telling';
import { sceneTags, type SceneTag } from './scene';
import type { Round } from './state';

/**
 * Picking words with memory. A line is chosen from its bank by a hash of the moment (the
 * exchange, how far through it the log is, who acts), never by the fight's dice, so the same
 * fight always reads the same and words never change what happens; but a template used in the
 * last few lines is passed over (`freshIndex`), so "You search" doesn't come back three
 * exchanges running. Each told line carries which bank and template it came from (`voiceLine`),
 * which is all the memory there is. When the same fighter does the same thing again, a bank's
 * `again` lines say so ("You search again, and still find no one."). A bank may keep lines for
 * where the moment is (`scene.ts`: the ground, a spar, a beast, someone near the end); a fresh
 * one of those is preferred most of the time, and the general lines fill in.
 */

/** How far back the story remembers what it has said. */
const RECENT_LINES = 6;
/**
 * How far back it remembers a scene's own lines, which are few and stand out: a wall that
 * cracks once in a fight is the room; twice in a row is the writer.
 */
export const SCENE_MEMORY = 18;
/**
 * Out of this many picks, the ones (all but one) that go to the scene's own lines when a fresh
 * one is there: most, not all, so a long fight among trees isn't told entirely in trees.
 */
const SCENE_PICKS = 3;

/** A moment in the log: where the pick hashes from, the lines just said, and where it is. */
export interface Moment {
  readonly key: string;
  readonly recent: readonly string[];
  readonly tags?: readonly SceneTag[];
  /** The longer memory for scene lines (`SCENE_MEMORY`); the recent lines when absent. */
  readonly earlier?: readonly string[];
}

/** A moment in the log, the same each time for this place in this fight. */
export function momentOf(round: Round, who: string): Moment {
  const said = [...(round.recent ?? []), ...round.lines].slice(-SCENE_MEMORY);
  return {
    key: `${round.number}:${round.lines.length}:${who}`,
    recent: said.slice(-RECENT_LINES),
    tags: sceneTags(round, who),
    earlier: said,
  };
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

/** Lines for some of the places a moment can be (`scene.ts`). */
export type SceneLines = Partial<Readonly<Record<SceneTag, readonly string[]>>>;

/**
 * Lines that tell one kind of beat, how to tell it when the same fighter repeats it, and lines
 * for particular scenes.
 */
export interface Bank {
  readonly id: string;
  readonly lines: readonly string[];
  readonly again?: readonly string[];
  readonly scene?: SceneLines;
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
  // Once told as a repeat (or in a scene's words), it is the same beat.
  const ids = [`${bank.id}.`, `${bank.id}-`];
  return moment.recent.some((line) => {
    const from = voicesOf(line).some((v) => ids.some((id) => v.startsWith(id)));
    return from && namedOf(line)[0] === who.id && (what === null || line.includes(what));
  });
}

/** The templates named in the moment's recent lines ("search.2"), oldest first. */
function recentVoices(moment: Moment): string[] {
  return moment.recent.flatMap(voicesOf);
}

/** Templates of this bank among those voices, by index, oldest first. */
function usedIn(voices: readonly string[], id: string): number[] {
  const prefix = `${id}.`;
  return voices.filter((v) => v.startsWith(prefix)).map((v) => Number(v.slice(prefix.length)));
}

function freshAmong(moment: Moment, used: readonly number[], size: number): number {
  if (new Set(used).size < size) return freshIndex(moment.key, size, used);
  const lastUse = (i: number) => used.lastIndexOf(i);
  return Array.from({ length: size }, (_, i) => i).reduce((a, b) =>
    lastUse(b) < lastUse(a) ? b : a,
  );
}

/**
 * A template of the bank not used lately, by the moment's hash; when every one has been, the
 * one used longest ago.
 */
export function freshPick(moment: Moment, id: string, size: number): number {
  return freshAmong(moment, usedIn(recentVoices(moment), id), size);
}

/** Which template a pick chose: the lines it came from (by id) and its place among them. */
export interface Chosen {
  readonly id: string;
  readonly index: number;
  readonly template: string;
}

/**
 * A line kept for one of the moment's scenes, most particular first, not said within the
 * scene memory, if there is one. The longer memory is read only when the bank has lines here.
 */
function sceneChoice(moment: Moment, bank: Bank): Chosen | null {
  const scene = bank.scene;
  if (!scene || !moment.tags?.length) return null;
  if (hashString(`${moment.key}:scene`) % SCENE_PICKS === 0) return null;
  let voices: readonly string[] | null = null;
  for (const tag of moment.tags) {
    const lines = scene[tag];
    if (!lines) continue;
    voices ??= (moment.earlier ?? moment.recent).flatMap(voicesOf);
    const id = `${bank.id}-${tag}`;
    const used = usedIn(voices, id);
    if (new Set(used).size >= lines.length) continue;
    const index = freshIndex(moment.key, lines.length, used);
    return { id, index, template: lines[index] ?? '' };
  }
  return null;
}

/**
 * The template a moment tells a beat with: a repeat's words when the same fighter just did it,
 * else a fresh line for the scene when there is one, else a fresh general line.
 */
export function choose(moment: Moment, bank: Bank, cast?: Cast): Chosen {
  const again = cast && bank.again && repeated(moment, bank, cast) ? bank.again : null;
  const scened = again ? null : sceneChoice(moment, bank);
  if (scened) return scened;
  const voices = recentVoices(moment);
  const id = again ? `${bank.id}-again` : bank.id;
  const lines = again ?? bank.lines;
  const index = freshAmong(moment, usedIn(voices, id), lines.length);
  const template = lines[index];
  if (template === undefined) throw new Error(`Narration bank ${bank.id} is empty`);
  return { id, index, template };
}

/** A fresh template from the bank, told with the cast and marked with where it came from. */
export function told(moment: Moment, bank: Bank, cast: Cast): string {
  const { id, index, template } = choose(moment, bank, cast);
  return voiceLine(tell(template, cast), `${id}.${index}`);
}

/** A fresh word from a bank of words (a verb), marked so it rests a while once used. */
export function freshWord(moment: Moment, bank: Bank): { word: string; mark: string } {
  const index = freshPick(moment, bank.id, bank.lines.length);
  return { word: bank.lines[index] ?? bank.lines[0] ?? '', mark: `${bank.id}.${index}` };
}
