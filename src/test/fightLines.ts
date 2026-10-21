/**
 * Reading a planned fight's log in tests, whatever words it picked. Every told line carries the
 * bank its words came from (`⟦v:…⟧`, `plan/fresh.ts`) and the defences that reacted (`⟦r:…⟧`),
 * so these helpers recognise a kind of line by its bank and the fighters by name, never by the
 * wording, which is free to change. Read them against the raw log, not `splitNarration` text.
 */

/** Escaped for a regular expression, any apostrophe matching either kind. */
function escaped(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]");
}

/** A line from one of these banks. */
function from(...banks: readonly string[]): string {
  return `⟦v:(?:${banks.join('|')})[.-]`;
}

/** A line from the banks that names every one of these (names, techniques), in any order. */
function line(banks: readonly string[], ...names: readonly string[]): RegExp {
  const needs = names.map((n) => `(?=.*${escaped(n)}(?![\\w-]))`).join('');
  return new RegExp(`^(?=.*${from(...banks)})${needs}`, 'i');
}

/** A hit landing on `target`, by any attack (or the one named, such as "Fireball"). */
export function hitsOn(target: string, what?: string): RegExp {
  return line(['hit-[a-z]+'], target, ...(what === undefined ? [] : [what]));
}

/** Any hit landing on anyone. */
export const A_HIT = new RegExp(from('hit-[a-z]+'));

/** An attack slipped, for whatever reason. */
export const SLIPS = new RegExp(from('slip', 'dodge', 'wide', 'foreseen'));

/** A substitution taking a hit. */
export const SWAPS = new RegExp(from('swap'));

/** A hold-off stopping someone, or someone getting through one. */
export function holdsOff(holder: string, closer: string): RegExp {
  return line(['held-off'], holder, closer);
}
export const GETS_THROUGH = new RegExp(from('through'));

/** A technique seen coming. */
export const SEES_IT_COMING = new RegExp(from('seen'));

/** A hit a Guard took the edge off (the stamp says so; the story doesn't), or one that smashes it. */
export const GUARDED = /⟦r:guarded⟧/;
export const SMASHED = /⟦r:guard-broken⟧/;

/** Someone dazed by a hit. */
export function dazes(target: string): RegExp {
  return line(['dazed'], target);
}

/** A search that finds no one. */
export function searchesInVain(actor: string): RegExp {
  return line(['search'], actor);
}

/** A search that finds someone. */
export function spots(actor: string, names: string): RegExp {
  return line(['found'], actor, names);
}

/** A chain's next link thrown on from the last: the line names its thrower and the move. */
export function linksLine(said: string, actor: string, technique: string): boolean {
  return line(['link-[a-z]+'], actor, technique).test(said);
}

/** A chain breaking off, for one reason (`missed`, `countered`, `out-of-reach`, `winded`) or any. */
export function chainBreaks(why = '[a-z-]+'): RegExp {
  return new RegExp(from(`chain-break-${why}`));
}

/** Someone using a technique: the line names them and it, and hurts no one. */
export function castsLine(said: string, actor: string, technique: string): boolean {
  return line(['cast-[a-z]+'], actor, technique).test(said) && !A_HIT.test(said);
}
