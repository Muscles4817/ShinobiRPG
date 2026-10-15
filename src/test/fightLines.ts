/**
 * Reading a planned fight's log in tests, whatever words it picked (`plan/voice.ts` varies
 * them by the moment). Each helper recognises every variant of one kind of line; `voice.test.ts`
 * checks that each bank's lines are all recognised, so a new variant can't slip past a test.
 */

const HIT_VERBS = [
  'hits',
  'slams into',
  'catches',
  'crashes into',
  'cuts',
  'bites into',
  'slashes',
  'finds',
  'binds',
  'locks onto',
  'burns into',
  'strikes',
  'scorches',
  'engulfs',
  'sears',
  'crashes over',
  'batters',
  'lances through',
  'jolts',
  'tears through',
  'rips into',
  'slices across',
  'hammers',
  'crushes',
  'pounds',
  'takes hold of',
  'grips',
  'sinks into',
];

function escaped(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** A hit landing on `target`, by any attacker's `what` (or the one named). */
export function hitsOn(target: string, what?: string): RegExp {
  const by = what === undefined ? "'s .+?" : escaped(what);
  return new RegExp(`${by} (?:${HIT_VERBS.join('|')}) ${escaped(target)}\\b`);
}

/** Any hit landing on anyone. */
export const A_HIT = new RegExp(`'s .+? (?:${HIT_VERBS.join('|')}) `);

/** An attack slipped. */
export const SLIPS = /slips past|twists clear of|cuts only air as|is already elsewhere when/;

/** A substitution taking a hit. */
export const SWAPS = /swaps out of|splinters a log where|is somewhere else when/;

/** A hold-off stopping someone, or someone getting through one. */
export function holdsOff(holder: string, closer: string): RegExp {
  const [h, c] = [escaped(holder), escaped(closer)];
  return new RegExp(`${h} keeps ${c} off|${h} won't let ${c} close|${h} meets ${c}'s rush`);
}
export const GETS_THROUGH = /slips through .+'s fire|weaves in under|runs the gauntlet of/;

/** A technique seen coming. */
export const SEES_IT_COMING =
  /sees it coming|reads the first sign and is ready|was waiting for exactly that/;

/** A hit through a guard, or one that smashes it. */
export const GUARDED = /through a guard|a raised guard takes the worst of it/;
export const SMASHED = /smashing through the guard|battering the guard aside/;

/** Someone dazed by a hit. */
export function dazes(target: string): RegExp {
  const t = escaped(target);
  return new RegExp(`${t} is dazed!|${t} reels, the world spinning|${t} staggers, dazed`);
}

/** A search that finds no one. */
export function searchesInVain(actor: string): RegExp {
  const a = escaped(actor);
  return new RegExp(
    `${a} searches, but finds no one|${a} scans the field: nothing|${a} looks hard and finds only shadows`,
  );
}

/** A search that finds someone. */
export function spots(actor: string, names: string): RegExp {
  const [a, n] = [escaped(actor), escaped(names)];
  return new RegExp(`${a} spots ${n}!|${a}'s eyes snap to ${n}!|${a} picks out ${n}!`);
}

/** Someone using a technique: the line names them, then it, and hurts no one. */
export function castsLine(line: string, actor: string, technique: string): boolean {
  const named = new RegExp(`${escaped(actor)}\\b.*${escaped(technique)}`).test(line);
  return named && !A_HIT.test(line);
}
