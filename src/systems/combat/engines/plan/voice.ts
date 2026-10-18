import type { Discipline, Element } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../../contract';
import type { Told } from '../../rules/telling';
import { told, type Bank, type Moment, type SceneLines } from './fresh';
import {
  castScenes,
  CLOSING_IN,
  DAZING,
  FALLING_BACK,
  FINDING,
  MISSING,
  SEARCHING,
} from './voiceScenes';

/**
 * How a planned fight tells itself: the same beat in different words, so a long fight doesn't
 * read like a ledger. Lines are templates told through `rules/telling.ts`, so the player is
 * "you" and everyone else agrees with their own grammar, and each is picked fresh by the moment
 * (`fresh.ts`), never by the fight's dice: the same fight always reads the same, and choosing
 * words never changes what happens. What lands names the attacker and then the one it lands
 * on, so the watch screen can tell who was hit (`views/fightReplay.ts`); hits themselves are
 * `hitVoice.ts`. Story text never carries numbers.
 */

export { momentOf, pick, type Moment } from './fresh';
export { hitLine, type HitTold, type Landing } from './hitVoice';

const bank = (
  id: string,
  lines: readonly string[],
  again?: readonly string[],
  scene?: SceneLines,
): Bank => ({ id, lines, ...(again ? { again } : {}), ...(scene ? { scene } : {}) });

/** Using a technique the fighter used just now: told as going back to it. */
const CAST_AGAIN = [
  '{a} go{a.es} back to {what}.',
  '{a} reach{a.es} for {what} again.',
  '{a} use{a.s} {what} once more.',
];

const CAST_BY_ART: Readonly<Record<Discipline, readonly string[]>> = {
  ninjutsu: [
    '{a} run{a.s} through the seals for {what}.',
    '{a.poss} hands blur through the seals, and {what} comes.',
    '{a} mould{a.s} chakra into {what}.',
  ],
  genjutsu: [
    '{a} cast{a.s} {what}.',
    '{a} catch{a.es} the eye and let{a.s} {what} unfold.',
    'The air around {a} wavers as {what} takes hold.',
  ],
  taijutsu: [
    '{a} go{a.es} in with {what}.',
    '{a} launch{a.es} into {what}.',
    '{a} explode{a.s} forward with {what}.',
  ],
  kenjutsu: [
    '{a} draw{a.s} into {what}.',
    '{a.poss} blade flows into {what}.',
    'Steel flashes as {a} loose{a.s} {what}.',
  ],
  fuuinjutsu: [
    '{a} write{a.s} {what} into the air.',
    '{a} slap{a.s} down a seal for {what}.',
    'Ink and chakra spill from {a.poss} hands into {what}.',
  ],
};

const CAST_BY_ELEMENT: Readonly<Record<Element, string>> = {
  fire: '{a} draw{a.s} a deep breath and let{a.s} {what} go.',
  water: '{a} pull{a.s} the water up into {what}.',
  lightning: 'Lightning crackles in {a.poss} hand as {what} gathers.',
  wind: '{a} send{a.s} {what} howling out.',
  earth: '{a} drive{a.s} {a.their} chakra into the ground, and {what} answers.',
};

/** Someone uses a technique: in the words of its art, or its element. */
export function castLine(moment: Moment, actor: Told, t: CombatTechnique): string {
  const byElement = t.element ? [CAST_BY_ELEMENT[t.element]] : [];
  const lines = [...CAST_BY_ART[t.discipline], ...byElement];
  const id = `cast-${t.element ?? t.discipline}`;
  return told(moment, bank(id, lines, CAST_AGAIN, castScenes(t.element)), {
    a: actor,
    what: t.name,
  });
}

/** Who slipped what: the one it was aimed at, whose attack, and what it was. */
export interface SlipTold {
  readonly target: Told;
  readonly attacker: Told;
  readonly what: string;
}

/** Why an attack missed: a ready Dodge, a wild attack, eyes that saw it coming, or plain luck. */
export type MissWhy = 'dodged' | 'wide' | 'foreseen' | 'slipped';

const MISSES: Readonly<Record<MissWhy, Bank>> = {
  dodged: bank(
    'dodge',
    [
      '{t} twist{t.s} clear of {a.poss} {what}.',
      '{a.poss} {what} cuts only air as {t} sway{t.s} aside.',
      '{t} duck{t.s} under {a.poss} {what}.',
    ],
    undefined,
    MISSING,
  ),
  wide: bank('wide', [
    '{a.poss} {what} goes wide of {t}.',
    '{a} overreach{a.es}, and the {what} sails past {t}.',
  ]),
  foreseen: bank('foreseen', [
    '{t} read{t.s} {a.poss} {what} before it comes and slip{t.s} past.',
    "{t.poss} eyes see the {what} coming, and {t.they}{t.'s} already elsewhere.",
    '{t} move{t.s} before {a} {a.does}, and the {what} slips past.',
  ]),
  slipped: bank(
    'slip',
    [
      '{t} slip{t.s} past {a.poss} {what}.',
      '{t} {t.is} already elsewhere when {a.poss} {what} arrives.',
      '{a.poss} {what} finds only the space where {t} stood.',
    ],
    undefined,
    MISSING,
  ),
};

/** An attack that missed, told by why. */
export function missLine(moment: Moment, why: MissWhy, slip: SlipTold): string {
  return told(moment, MISSES[why], { t: slip.target, a: slip.attacker, what: slip.what });
}

const SEEN = bank('seen', [
  '{t} see{t.s} it coming.',
  '{t} read{t.s} the first sign and {t.is} ready.',
  '{t} {t.was} waiting for exactly that.',
]);

/** Someone reads a technique coming and isn't there for it. */
export function seenLine(moment: Moment, foe: Told): string {
  return told(moment, SEEN, { t: foe });
}

const STEPS: Readonly<Record<RangeBand, Bank>> = {
  close: bank(
    'step-in',
    ['{a} close{a.s} in.', '{a} dart{a.s} in close.', '{a} get{a.s} inside {f.poss} reach.'],
    ['{a} close{a.s} in again.'],
    CLOSING_IN,
  ),
  mid: bank('step-mid', ['{a} close{a.s} the gap to mid range.', '{a} come{a.s} in to mid range.']),
  far: bank(
    'step-far',
    ['{a} fall{a.s} back out of reach.', '{a} spring{a.s} back to far range.'],
    undefined,
    FALLING_BACK,
  ),
};

const BACK_TO_MID = bank('step-back', [
  '{a} fall{a.s} back to mid range.',
  '{a} give{a.s} ground to mid range.',
]);

/** A step that came off: who moved, where to, which way, and the foe they moved on. */
export interface StepTold {
  readonly actor: Told;
  readonly to: RangeBand;
  readonly closing: boolean;
  readonly foe?: Told;
}

/** A step that lands where it meant to: in close, the gap closed, or ground given. */
export function stepLine(moment: Moment, step: StepTold): string {
  const steps = step.to === 'mid' && !step.closing ? BACK_TO_MID : STEPS[step.to];
  return told(moment, steps, { a: step.actor, f: step.foe ?? step.actor });
}

/** What a step was for, in words: "close in", "get back out of reach". */
const GOALS: Readonly<Record<RangeBand, string>> = {
  close: 'close in',
  mid: 'reach mid range',
  far: 'get back out of reach',
};

const BLOCKED = bank(
  'blocked',
  [
    '{a} make{a.s} to {goal}, but {f} won’t allow it.',
    '{f} cut{f.s} {a} off before {a.they} can {goal}.',
    '{a} feint{a.s}, looking to {goal}, and {f} {f.does}n’t bite.',
  ],
  ['{a} make{a.s} another try, and {f} shut{f.s} it down again.'],
);

/** A step the foe won't allow. */
export function blockedStepLine(moment: Moment, actor: Told, to: RangeBand, foe: Told): string {
  return told(moment, BLOCKED, { a: actor, f: foe, goal: GOALS[to] });
}

const DAZED = bank(
  'dazed',
  ['{t} {t.is} dazed.', '{t} reel{t.s}, the world spinning.', '{t} stagger{t.s}, dazed.'],
  undefined,
  DAZING,
);

/** A daze takes hold. */
export function dazeLine(moment: Moment, target: Told): string {
  return told(moment, DAZED, { t: target });
}

const REELING = bank('reeling', [
  '{a} {a.is} dazed and lose{a.s} the exchange.',
  '{a} shake{a.s} {a.their} head, still reeling.',
  '{a} can’t find {a.their} feet yet.',
]);

/** A dazed fighter's lost turn. */
export function reelingLine(moment: Moment, actor: Told): string {
  return told(moment, REELING, { a: actor });
}

const EMPTY_SEARCH = bank(
  'search',
  [
    '{a} search{a.es} the field and find{a.s} no one.',
    '{a} scan{a.s} the field and see{a.s} nothing.',
    '{a} look{a.s} hard and find{a.s} only shadows.',
  ],
  [
    '{a} search{a.es} again, and still find{a.s} no one.',
    '{a} look{a.s} again, with no more luck.',
  ],
  SEARCHING,
);

/** A search that finds no one. */
export function emptySearchLine(moment: Moment, actor: Told): string {
  return told(moment, EMPTY_SEARCH, { a: actor });
}

const FOUND = bank(
  'found',
  ['{a} spot{a.s} {found}.', '{a.poss} eyes snap to {found}.', '{a} pick{a.s} out {found}.'],
  undefined,
  FINDING,
);

/** A search that finds someone. */
export function foundLine(moment: Moment, actor: Told, found: readonly Told[]): string {
  return told(moment, FOUND, { a: actor, found });
}

const COUNTER = bank('counter', [
  '{t} counter{t.s}.',
  '{t} answer{t.s} the blow with one of {t.their} own.',
  '{t} turn{t.s} the attack back on its owner.',
]);

/** A counter landing on the one who struck. */
export function counterLine(moment: Moment, target: Told): string {
  return told(moment, COUNTER, { t: target });
}

const CHARGE = bank('charge', [
  '{a} charge{a.s} in with {what}.',
  '{a} launch{a.es} into {what}.',
  '{a} hurl{a.s} {a.themself} forward into {what}.',
]);

/** Someone charging in with an entry (it may yet be met by a hold-off). */
export function chargeLine(moment: Moment, actor: Told, technique: string): string {
  return told(moment, CHARGE, { a: actor, what: technique });
}
