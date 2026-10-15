import { hashString } from '@/core';
import type { Discipline, Element } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';
import type { AttackKind } from '../../rules/kit';
import { reactionLine, type NarrationReaction } from '../../rules/narration';
import type { Round } from './state';

/**
 * How a planned fight tells itself: the same beat in different words, so a long fight doesn't
 * read like a ledger. A line is picked from its bank by a hash of the moment (the exchange,
 * how far through it the log is, who acts), never by the fight's dice: the same fight always
 * reads the same, and choosing words never changes what happens. What lands names the
 * attacker and then the one it lands on, and no one else, so the watch screen can tell who
 * was hit (`views/fightReplay.ts`). Story text never carries numbers.
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

const CAST_BY_ART: Readonly<Record<Discipline, readonly ((a: string, t: string) => string)[]>> = {
  ninjutsu: [
    (a, t) => `${a} uses ${t}!`,
    (a, t) => `${a}'s hands blur through the seals: ${t}!`,
    (a, t) => `${a} moulds chakra into ${t}!`,
  ],
  genjutsu: [
    (a, t) => `${a} casts ${t}.`,
    (a, t) => `${a} catches the eye and lets ${t} unfold.`,
    (a, t) => `The air around ${a} wavers: ${t}.`,
  ],
  taijutsu: [
    (a, t) => `${a} uses ${t}!`,
    (a, t) => `${a} launches into ${t}!`,
    (a, t) => `${a} explodes forward with ${t}!`,
  ],
  kenjutsu: [
    (a, t) => `${a} uses ${t}!`,
    (a, t) => `${a}'s blade flows into ${t}!`,
    (a, t) => `Steel flashes as ${a} looses ${t}!`,
  ],
  fuuinjutsu: [
    (a, t) => `${a} uses ${t}!`,
    (a, t) => `${a} slaps down a seal: ${t}!`,
    (a, t) => `Ink and chakra spill from ${a}'s hands: ${t}!`,
  ],
};

const CAST_BY_ELEMENT: Readonly<Record<Element, (a: string, t: string) => string>> = {
  fire: (a, t) => `${a} draws a deep breath and unleashes ${t}!`,
  water: (a, t) => `Water gathers around ${a}: ${t}!`,
  lightning: (a, t) => `Lightning crackles in ${a}'s hand: ${t}!`,
  wind: (a, t) => `${a} sends ${t} howling out!`,
  earth: (a, t) => `The ground answers ${a}: ${t}!`,
};

/** Someone uses a technique: in the words of its art, or its element. */
export function castLine(moment: string, actor: string, t: CombatTechnique): string {
  const byArt = CAST_BY_ART[t.discipline];
  const byElement = t.element ? [CAST_BY_ELEMENT[t.element]] : [];
  return pick(moment, [...byArt, ...byElement])(actor, t.name);
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
  readonly attacker: string;
  readonly target: string;
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
  const line = `${hit.attacker}'s ${hit.blow.what} ${verb} ${hit.target}${again}${guard}.`;
  return reactionLine(line, ...reactionsTo(hit));
}

/** Someone slips an attack. */
export function slipLine(moment: string, target: string, attacker: string, what: string): string {
  return pick(moment, [
    `${target} slips past ${attacker}'s ${what}.`,
    `${target} twists clear of ${attacker}'s ${what}.`,
    `${attacker}'s ${what} cuts only air as ${target} sways aside.`,
    `${target} is already elsewhere when ${attacker}'s ${what} arrives.`,
  ]);
}

/** Someone reads a technique coming and isn't there for it. */
export function seenLine(moment: string, foe: string): string {
  return pick(moment, [
    `${foe} sees it coming.`,
    `${foe} reads the first sign and is ready.`,
    `${foe} was waiting for exactly that.`,
  ]);
}

/** A step that lands where it meant to. */
export function stepLine(moment: string, actor: string, where: string, closing: boolean): string {
  return pick(
    moment,
    closing
      ? [
          `${actor} moves to ${where} range.`,
          `${actor} closes to ${where} range.`,
          `${actor} darts in to ${where} range.`,
        ]
      : [
          `${actor} moves to ${where} range.`,
          `${actor} falls back to ${where} range.`,
          `${actor} springs back to ${where} range.`,
        ],
  );
}

/** A step the foe won't allow. */
export function blockedStepLine(moment: string, actor: string, where: string, foe: string): string {
  return pick(moment, [
    `${actor} tries for ${where} range, but ${foe} won't allow it.`,
    `${foe} cuts off ${actor}'s move to ${where} range.`,
    `${actor} feints towards ${where} range; ${foe} doesn't bite.`,
  ]);
}

/** A daze takes hold. */
export function dazeLine(moment: string, target: string): string {
  return pick(moment, [
    `${target} is dazed!`,
    `${target} reels, the world spinning.`,
    `${target} staggers, dazed.`,
  ]);
}

/** A dazed fighter's lost turn. */
export function reelingLine(moment: string, actor: string): string {
  return pick(moment, [
    `${actor} is dazed and loses the exchange.`,
    `${actor} shakes their head, still reeling.`,
    `${actor} can't find their feet yet.`,
  ]);
}

/** A search that finds no one. */
export function emptySearchLine(moment: string, actor: string): string {
  return pick(moment, [
    `${actor} searches, but finds no one.`,
    `${actor} scans the field: nothing.`,
    `${actor} looks hard and finds only shadows.`,
  ]);
}

/** A search that finds someone. */
export function foundLine(moment: string, actor: string, names: string): string {
  return pick(moment, [
    `${actor} spots ${names}!`,
    `${actor}'s eyes snap to ${names}!`,
    `${actor} picks out ${names}!`,
  ]);
}

/** A counter landing on the one who struck. */
export function counterLine(moment: string, target: string): string {
  return pick(moment, [
    `${target} counters!`,
    `${target} answers the blow with one of their own!`,
    `${target} turns the attack back on its owner!`,
  ]);
}
