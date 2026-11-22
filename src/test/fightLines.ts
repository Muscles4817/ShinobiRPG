import { toldIn, toldText, type CombatEvent, type ToldEvent } from '@/systems/combat';
import { toldFrom } from '@/systems/combat/rules/narration';

/**
 * Reading a planned fight's story in tests, whatever words it picked. Every told line says which
 * bank its words came from (`voices`, `plan/fresh.ts`), whom it names and the defences that
 * reacted, so these helpers recognise a kind of line by its bank and the fighters by name (or
 * id), never by the wording, which is free to change. They read a told event, or a line as an
 * engine's line builder wrote it (read as the story's writer would, `toldFrom`).
 */

export type Said = ToldEvent | string;

/** Something a line may be: `test` it against one. */
export interface LineTest {
  readonly test: (line: Said) => boolean;
}

function toldOf(line: Said): ToldEvent {
  return typeof line === 'string' ? toldFrom(line) : line;
}

/** Escaped for a regular expression, any apostrophe matching either kind. */
function escaped(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]");
}

/** A line whose words came from one of these banks (each a pattern). */
function fromBanks(told: ToldEvent, banks: readonly string[]): boolean {
  const bank = new RegExp(`^(?:${banks.join('|')})[.-]`);
  return (told.voices ?? []).some((v) => bank.test(v));
}

/** A line that names this fighter or thing: in its words, or among whom it names, by id. */
function names(told: ToldEvent, name: string): boolean {
  const lower = name.toLowerCase();
  if ((told.named ?? []).some((id) => id.toLowerCase() === lower)) return true;
  return new RegExp(`${escaped(name)}(?![\\w-])`, 'i').test(told.text);
}

/** A line from the banks that names every one of these (names, techniques), in any order. */
function line(banks: readonly string[], ...all: readonly string[]): LineTest {
  return {
    test: (said) => {
      const told = toldOf(said);
      return fromBanks(told, banks) && all.every((n) => names(told, n));
    },
  };
}

function reacted(reaction: string): LineTest {
  return { test: (said) => (toldOf(said).reactions ?? []).some((r) => r.reaction === reaction) };
}

/** A hit landing on `target`, by any attack (or the one named, such as "Fireball"). */
export function hitsOn(target: string, what?: string): LineTest {
  return line(['hit-[a-z]+'], target, ...(what === undefined ? [] : [what]));
}

/** Any hit landing on anyone. */
export const A_HIT = line(['hit-[a-z]+']);

/** An attack slipped, for whatever reason. */
export const SLIPS = line(['slip', 'dodge', 'wide', 'foreseen']);

/** A substitution taking a hit. */
export const SWAPS = line(['swap']);

/** A hold-off stopping someone, or someone getting through one. */
export function holdsOff(holder: string, closer: string): LineTest {
  return line(['held-off'], holder, closer);
}
export const GETS_THROUGH = line(['through']);

/** A technique seen coming. */
export const SEES_IT_COMING = line(['seen']);

/** A hit a Guard took the edge off (the stamp says so; the story doesn't), or one that smashes it. */
export const GUARDED = reacted('guarded');
export const SMASHED = reacted('guard-broken');

/** Someone dazed by a hit. */
export function dazes(target: string): LineTest {
  return line(['dazed'], target);
}

/** A search that finds no one. */
export function searchesInVain(actor: string): LineTest {
  return line(['search'], actor);
}

/** A search that finds someone. */
export function spots(actor: string, who: string): LineTest {
  return line(['found'], actor, who);
}

/** A chain's next link thrown on from the last: the line names its thrower and the move. */
export function linksLine(said: Said, actor: string, technique: string): boolean {
  return line(['link-[a-z]+'], actor, technique).test(said);
}

/** A chain breaking off, for one reason (`missed`, `countered`, `out-of-reach`, `winded`) or any. */
export function chainBreaks(why = '[a-z-]+'): LineTest {
  return line([`chain-break-${why}`]);
}

/** Someone using a technique: the line names them and it, and hurts no one. */
export function castsLine(said: Said, actor: string, technique: string): boolean {
  return line(['cast-[a-z]+'], actor, technique).test(said) && !A_HIT.test(said);
}

/** Any of these lines is one of these. */
export function anyIs(lines: readonly Said[], kind: LineTest): boolean {
  return lines.some((l) => kind.test(l));
}

/** A story's told lines, as events: what these helpers read. */
export function linesOf(story: readonly CombatEvent[]): ToldEvent[] {
  return toldIn(story);
}

/** A story's words, line by line. */
export function textOf(story: readonly CombatEvent[]): string[] {
  return toldText(story);
}

/** A line as written, read into the event it tells: its words, and what it carries. */
export function told(line: string): ToldEvent {
  return toldFrom(line);
}

/** What a test waits for: a kind of line, or words in it. */
export type Wanted = LineTest | RegExp;

/** Whether a line is the kind wanted, or has the words wanted. */
export function matches(line: Said, wanted: Wanted): boolean {
  return wanted instanceof RegExp ? wanted.test(toldOf(line).text) : wanted.test(line);
}

/** What a test waited for, for its message when no seed gave it. */
export function wantedName(wanted: Wanted): string {
  return wanted instanceof RegExp ? wanted.source : 'the line wanted';
}
