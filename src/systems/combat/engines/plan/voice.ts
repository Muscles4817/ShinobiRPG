import { hashString } from '@/core';
import type { Discipline, Element } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';
import type { AttackKind } from '../../rules/kit';
import { reactionLine, type NarrationReaction } from '../../rules/narration';
import { tell, type Told } from '../../rules/telling';
import type { Round } from './state';

/**
 * How a planned fight tells itself: the same beat in different words, so a long fight doesn't
 * read like a ledger. A line is picked from its bank by a hash of the moment (the exchange,
 * how far through it the log is, who acts), never by the fight's dice: the same fight always
 * reads the same, and choosing words never changes what happens. Lines are templates told
 * through `rules/telling.ts`, so the player is "you" and everyone else agrees with their own
 * grammar; what lands names the attacker and then the one it lands on, and no one else, so the
 * watch screen can tell who was hit (`views/fightReplay.ts`). Story text never carries numbers.
 */

/** A moment in the log: picks a line from a bank, the same one each time for this moment. */
export function momentOf(round: Round, who: string): string {
  return `${round.number}:${round.lines.length}:${who}`;
}

export function pick<T>(moment: string, bank: readonly T[]): T {
  const line = bank[hashString(moment) % bank.length];
  if (line === undefined) throw new Error('A narration bank is empty');
  return line;
}

const CAST_BY_ART: Readonly<Record<Discipline, readonly string[]>> = {
  ninjutsu: [
    '{a} use{a.s} {what}!',
    '{a.poss} hands blur through the seals: {what}!',
    '{a} mould{a.s} chakra into {what}!',
  ],
  genjutsu: [
    '{a} cast{a.s} {what}.',
    '{a} catch{a.es} the eye and let{a.s} {what} unfold.',
    'The air around {a} wavers: {what}.',
  ],
  taijutsu: [
    '{a} use{a.s} {what}!',
    '{a} launch{a.es} into {what}!',
    '{a} explode{a.s} forward with {what}!',
  ],
  kenjutsu: [
    '{a} use{a.s} {what}!',
    '{a.poss} blade flows into {what}!',
    'Steel flashes as {a} loose{a.s} {what}!',
  ],
  fuuinjutsu: [
    '{a} use{a.s} {what}!',
    '{a} slap{a.s} down a seal: {what}!',
    'Ink and chakra spill from {a.poss} hands: {what}!',
  ],
};

const CAST_BY_ELEMENT: Readonly<Record<Element, string>> = {
  fire: '{a} draw{a.s} a deep breath and unleash{a.es} {what}!',
  water: 'Water gathers around {a}: {what}!',
  lightning: 'Lightning crackles in {a.poss} hand: {what}!',
  wind: '{a} send{a.s} {what} howling out!',
  earth: 'The ground answers {a}: {what}!',
};

/** Someone uses a technique: in the words of its art, or its element. */
export function castLine(moment: string, actor: Told, t: CombatTechnique): string {
  const byArt = CAST_BY_ART[t.discipline];
  const byElement = t.element ? [CAST_BY_ELEMENT[t.element]] : [];
  return tell(pick(moment, [...byArt, ...byElement]), { a: actor, what: t.name });
}

/** What a hit lands as, for the verb that tells it (a blow, as `react.ts` lands it). */
export interface Landing {
  readonly what: string;
  readonly kind: AttackKind;
  readonly discipline?: Discipline;
  readonly element?: Element;
  /** Hand-to-hand and blades in hand; thrown steel isn't. */
  readonly physical: boolean;
  /** A later blow of a flurry. */
  readonly followUp?: true;
}

const VERBS_BY_ELEMENT: Readonly<Record<Element, readonly string[]>> = {
  fire: ['scorches', 'engulfs', 'sears'],
  water: ['crashes over', 'slams into', 'batters'],
  lightning: ['lances through', 'jolts', 'tears through'],
  wind: ['rips into', 'slices across', 'hammers'],
  earth: ['batters', 'crushes', 'pounds'],
};

function verbsFor(landing: Landing): readonly string[] {
  if (landing.discipline === 'genjutsu') return ['takes hold of', 'grips', 'sinks into'];
  if (landing.element) return VERBS_BY_ELEMENT[landing.element];
  switch (landing.kind) {
    case 'blow':
      return ['hits', 'slams into', 'catches', 'crashes into'];
    case 'weapon':
      return landing.physical ? ['cuts', 'bites into', 'slashes'] : ['hits', 'catches', 'finds'];
    case 'seal':
      return ['binds', 'locks onto', 'burns into'];
    case 'jutsu':
      return ['hits', 'strikes', 'slams into'];
  }
}

const AGAIN = [' again', ' once more', ' a second time'];
const GUARDED = [' through a guard', ', though a raised guard takes the worst of it'];
const SMASHED = [', smashing through the guard', ', battering the guard aside'];

export interface HitTold {
  readonly attacker: Told;
  readonly target: Told;
  readonly blow: Landing;
  readonly guarded: boolean;
  readonly smashed: boolean;
  /** A Dodge was ready and tried for this blow. */
  readonly dodgeTried: boolean;
}

/** Which ready defence reacted to a blow that landed anyway, for the fight screen. */
function reactionsTo({ dodgeTried, guarded, smashed }: HitTold): NarrationReaction[] {
  return [
    ...(dodgeTried ? (['dodge-missed'] as const) : []),
    ...(guarded ? (['guarded'] as const) : []),
    ...(smashed ? (['guard-broken'] as const) : []),
  ];
}

/**
 * A hit landing: the attacker's attack, a verb for what it is, and how the guard fared, tagged
 * with the defences that reacted.
 */
export function hitLine(moment: string, hit: HitTold): string {
  const verb = pick(moment, verbsFor(hit.blow));
  const again = hit.blow.followUp ? pick(`${moment}:again`, AGAIN) : '';
  const guard = hit.smashed
    ? pick(`${moment}:guard`, SMASHED)
    : hit.guarded
      ? pick(`${moment}:guard`, GUARDED)
      : '';
  const line = tell(`{a.poss} {what} ${verb} {t}${again}${guard}.`, {
    a: hit.attacker,
    t: hit.target,
    what: hit.blow.what,
  });
  return reactionLine(line, ...reactionsTo(hit));
}

/** Who slipped what: the one it was aimed at, whose attack, and what it was. */
export interface SlipTold {
  readonly target: Told;
  readonly attacker: Told;
  readonly what: string;
}

/** Someone slips an attack. */
export function slipLine(moment: string, { target, attacker, what }: SlipTold): string {
  return tell(
    pick(moment, [
      '{t} slip{t.s} past {a.poss} {what}.',
      '{t} twist{t.s} clear of {a.poss} {what}.',
      '{a.poss} {what} cuts only air as {t} sway{t.s} aside.',
      '{t} {t.is} already elsewhere when {a.poss} {what} arrives.',
    ]),
    { t: target, a: attacker, what },
  );
}

/** Someone whose eyes read the blow before it comes. */
export function foresightSlipLine(moment: string, { target, attacker, what }: SlipTold): string {
  return tell(
    pick(moment, [
      '{t} read{t.s} {a.poss} {what} before it comes and slip{t.s} past.',
      "{t.poss} eyes see the {what} coming, and {t.they}{t.'s} already elsewhere.",
      '{t} move{t.s} before {a} {a.does}, and the {what} slips past.',
    ]),
    { t: target, a: attacker, what },
  );
}

/** Someone reads a technique coming and isn't there for it. */
export function seenLine(moment: string, foe: Told): string {
  return tell(
    pick(moment, [
      '{t} see{t.s} it coming.',
      '{t} read{t.s} the first sign and {t.is} ready.',
      '{t} {t.was} waiting for exactly that.',
    ]),
    { t: foe },
  );
}

/** A step that lands where it meant to. */
export function stepLine(moment: string, actor: Told, where: string, closing: boolean): string {
  const bank = closing
    ? ['{a} move{a.s} to {where} range.', '{a} close{a.s} to {where} range.']
    : ['{a} move{a.s} to {where} range.', '{a} fall{a.s} back to {where} range.'];
  return tell(pick(moment, bank), { a: actor, where });
}

/** A step the foe won't allow. */
export function blockedStepLine(moment: string, actor: Told, where: string, foe: Told): string {
  return tell(
    pick(moment, [
      '{a} make{a.s} for {where} range, but {f} won’t allow it.',
      '{f} cut{f.s} off {a.poss} move to {where} range.',
      '{a} feint{a.s} towards {where} range, and {f} {f.does}n’t bite.',
    ]),
    { a: actor, f: foe, where },
  );
}

/** A daze takes hold. */
export function dazeLine(moment: string, target: Told): string {
  return tell(
    pick(moment, [
      '{t} {t.is} dazed!',
      '{t} reel{t.s}, the world spinning.',
      '{t} stagger{t.s}, dazed.',
    ]),
    { t: target },
  );
}

/** A dazed fighter's lost turn. */
export function reelingLine(moment: string, actor: Told): string {
  return tell(
    pick(moment, [
      '{a} {a.is} dazed and lose{a.s} the exchange.',
      '{a} shake{a.s} {a.their} head, still reeling.',
      '{a} can’t find {a.their} feet yet.',
    ]),
    { a: actor },
  );
}

/** A search that finds no one. */
export function emptySearchLine(moment: string, actor: Told): string {
  return tell(
    pick(moment, [
      '{a} search{a.es}, but find{a.s} no one.',
      '{a} scan{a.s} the field: nothing.',
      '{a} look{a.s} hard and find{a.s} only shadows.',
    ]),
    { a: actor },
  );
}

/** A search that finds someone. */
export function foundLine(moment: string, actor: Told, found: readonly Told[]): string {
  return tell(
    pick(moment, [
      '{a} spot{a.s} {found}!',
      '{a.poss} eyes snap to {found}!',
      '{a} pick{a.s} out {found}!',
    ]),
    { a: actor, found },
  );
}

/** A counter landing on the one who struck. */
export function counterLine(moment: string, target: Told): string {
  return tell(
    pick(moment, [
      '{t} counter{t.s}!',
      '{t} answer{t.s} the blow with one of {t.their} own!',
      '{t} turn{t.s} the attack back on its owner!',
    ]),
    { t: target },
  );
}

/** Someone charging in with an entry (it may yet be met by a hold-off). */
export function chargeLine(moment: string, actor: Told, technique: string): string {
  return tell(
    pick(moment, [
      '{a} charge{a.s} in with {what}!',
      '{a} launch{a.es} into {what}!',
      '{a} hurl{a.s} {a.themself} forward: {what}!',
    ]),
    { a: actor, what: technique },
  );
}
