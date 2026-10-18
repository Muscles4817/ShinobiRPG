/**
 * Reading a planned fight's log in tests, whatever words it picked (`plan/voice.ts` varies
 * them by the moment). Each helper recognises every variant of one kind of line; `voice.test.ts`
 * checks that each bank's lines are all recognised, so a new variant can't slip past a test.
 * Names are matched as the story tells them; an apostrophe matches a straight or a curly one.
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

/** Escaped for a regular expression, any apostrophe matching either kind. */
function escaped(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]");
}

/** Someone's: "Ryo’s", "the bandit’s" or "Your". */
const WHOSE = "(?:['’]s|^Your|\\byour)";

/** A hit landing on `target`, by any attacker's `what` (or the one named). */
export function hitsOn(target: string, what?: string): RegExp {
  const by = what === undefined ? `${WHOSE} .+?` : escaped(what);
  return new RegExp(`${by} (?:${HIT_VERBS.join('|')}) ${escaped(target)}\\b`, 'i');
}

/** Any hit landing on anyone. */
export const A_HIT = new RegExp(`${WHOSE} .+? (?:${HIT_VERBS.join('|')}) `);

/** An attack slipped. */
export const SLIPS =
  /slips? past|twists? clear of|cuts only air as|(?:is|are) already elsewhere when|['’](?:s|re) already elsewhere/;

/** A substitution taking a hit. */
export const SWAPS = /swaps? out of|splinters the log|(?:is|are) somewhere else by the time/;

/** A hold-off stopping someone, or someone getting through one. */
export function holdsOff(holder: string, closer: string): RegExp {
  const [h, c] = [escaped(holder), escaped(closer)];
  return new RegExp(
    `${h} keeps? ${c} off|${h} won['’]t let ${c} close|${h} meets? ${c}['’]s rush`,
    'i',
  );
}
export const GETS_THROUGH = /slips? through .+['’]s fire|weaves? in under|runs? the gauntlet of/;

/** A technique seen coming. */
export const SEES_IT_COMING =
  /sees? it coming|reads? the first sign and (?:is|are) ready|(?:was|were) waiting for exactly that/;

/** A hit a Guard took the edge off (the stamp says so; the story doesn't), or one that smashes it. */
export const GUARDED = /⟦r:guarded⟧/;
export const SMASHED = /smashing through the guard|battering the guard aside/;

/** Someone dazed by a hit. */
export function dazes(target: string): RegExp {
  const t = escaped(target);
  return new RegExp(
    `${t} (?:is|are) dazed\\.|${t} reels?, the world spinning|${t} staggers?, dazed`,
    'i',
  );
}

/** A search that finds no one. */
export function searchesInVain(actor: string): RegExp {
  const a = escaped(actor);
  return new RegExp(
    `${a} search(?:es)?, but finds? no one|${a} scans? the field and sees? nothing|${a} looks? hard and finds? only shadows`,
    'i',
  );
}

/** A search that finds someone. */
export function spots(actor: string, names: string): RegExp {
  const [a, n] = [escaped(actor), escaped(names)];
  return new RegExp(
    `${a} spots? ${n}\\.|${a}['’]s eyes snap to ${n}\\.|${a} picks? out ${n}\\.`,
    'i',
  );
}

/** Someone using a technique: the line names them, then it, and hurts no one. */
export function castsLine(line: string, actor: string, technique: string): boolean {
  const named = new RegExp(`${escaped(actor)}\\b.*${escaped(technique)}`, 'i').test(line);
  return named && !A_HIT.test(line);
}
