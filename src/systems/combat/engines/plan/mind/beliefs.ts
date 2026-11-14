import type { StatGrade } from '@/systems/stats';

import { alive, hasPerk } from '../../../rules/body';
import { maxBreath } from '../../../rules/breath';
import { gradeOf } from '../judgement';
import { inSight, opponentsOf } from '../senses';
import type { PlanFighter, Round } from '../state';
import { NO_EVIDENCE, weighed } from './evidence';
import type { Beliefs, Witness } from './shape';

/**
 * What each fighter makes of what they saw (`docs/design/combat-ai-plan.md` Part 5), folded in as
 * the exchange ends: habits (the defence kept at each distance, the style of attack leaned on, a
 * technique come back to), capabilities shown (reach, an area, a hold, a heal) and resources read
 * (chakra and breath running low). How clearly they saw it weighs it: a fighter who hides their
 * moves well is only glimpsed by a less perceptive one. Which hypotheses a mind keeps at all is
 * bounded by its intellect: a dull brawler minds only defences and styles.
 *
 * Shown only: no choice in the fight reads a belief yet.
 */

type Family = 'defence' | 'style' | 'card' | 'can' | 'low';

const FAMILIES: Readonly<Record<StatGrade, readonly Family[]>> = {
  E: ['defence', 'style'],
  D: ['defence', 'style'],
  C: ['defence', 'style', 'card', 'can'],
  B: ['defence', 'style', 'card', 'can', 'low'],
  A: ['defence', 'style', 'card', 'can', 'low'],
  S: ['defence', 'style', 'card', 'can', 'low'],
};

/** A glimpse counts for this share of a clear sight. */
const GLIMPSE = 0.5;
/** A capability shown is a fact, not a habit: one clear sight goes most of the way. */
const SHOWN_WEIGHT = 8;
/**
 * A defence is kept ready at a distance until the plan changes it between rounds, so each sight of
 * it says more than a single attack says of a habit.
 */
const DEFENCE_WEIGHT = 6;
/** Below this share of a pool, it reads as running low. */
const LOW_SHARE = 0.35;
/** How well a fighter hides what they do: mostly their own perception (Part 5's decision). */
const CONCEAL = { perception: 0.7, speed: 0.2, art: 0.1, offset: 3 } as const;

const ARTS = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'] as const;

function concealment(f: PlanFighter): number {
  const a = f.attributes;
  const art = Math.max(...ARTS.map((s) => a[s]));
  return (
    CONCEAL.perception * a.perception + CONCEAL.speed * a.speed + CONCEAL.art * art - CONCEAL.offset
  );
}

/** How clearly an observer sees what a fighter does: eyes that read foes see it all. */
export function clarity(observer: PlanFighter, subject: PlanFighter): number {
  if (hasPerk(observer, 'insight')) return 1;
  return observer.attributes.perception >= concealment(subject) ? 1 : GLIMPSE;
}

export function keeps(mind: PlanFighter, family: Family): boolean {
  return FAMILIES[gradeOf(mind)].includes(family);
}

/** One observation: each key that rival hypotheses share, for the one seen and against the rest. */
interface Seen {
  readonly key: string;
  readonly rivals: readonly string[];
  readonly weight: number;
}

function fold(mind: PlanFighter, beliefs: Beliefs, seen: Seen, now: number): Beliefs {
  const add = (b: Beliefs, key: string, weight: number) => ({
    ...b,
    [key]: weighed(mind, b[key] ?? NO_EVIDENCE, { weight, now }),
  });
  const own = add(beliefs, seen.key, seen.weight);
  return seen.rivals.filter((k) => k !== seen.key).reduce((b, k) => add(b, k, -seen.weight), own);
}

const STYLES = ['blow', 'flurry', 'break', 'sure', 'illusion', 'jutsu'] as const;
const DEFENCES = ['guard', 'dodge', 'counter', 'swap'] as const;

/** What a mind takes from one thing it saw. */
function seenIn(mind: PlanFighter, about: Beliefs, w: Witness, clear: number): Seen[] {
  if (w.kind === 'defence') {
    if (!keeps(mind, 'defence')) return [];
    const rivals = DEFENCES.map((d) => `defence:${w.band}:${d}`);
    return [{ key: `defence:${w.band}:${w.defence}`, rivals, weight: DEFENCE_WEIGHT * clear }];
  }
  const style: Seen[] =
    w.style && keeps(mind, 'style')
      ? [{ key: `style:${w.style}`, rivals: STYLES.map((s) => `style:${s}`), weight: clear }]
      : [];
  const cards = Object.keys(about).filter((k) => k.startsWith('card:'));
  const card: Seen[] = keeps(mind, 'card')
    ? [{ key: `card:${w.card}`, rivals: cards, weight: clear }]
    : [];
  const shown: Seen[] = keeps(mind, 'can')
    ? w.shows.map((c) => ({ key: `can:${c}`, rivals: [], weight: SHOWN_WEIGHT * clear }))
    : [];
  return [...style, ...card, ...shown];
}

/** Pools read off a foe in sight: running low, or not. */
function readings(subject: PlanFighter, clear: number): Seen[] {
  const breath = (subject.breath ?? maxBreath(subject.attributes)) / maxBreath(subject.attributes);
  const chakra = subject.maxChakra > 0 ? subject.chakra / subject.maxChakra : 1;
  const low = (share: number) => (share < LOW_SHARE ? clear : -clear);
  return [
    { key: 'low:chakra', rivals: [], weight: low(chakra) },
    { key: 'low:breath', rivals: [], weight: low(breath) },
  ];
}

function aboutAfter(mind: PlanFighter, subject: PlanFighter, round: Round): Beliefs {
  const clear = clarity(mind, subject);
  const now = round.number;
  const seen = (round.witnessed ?? []).filter(
    (w) => w.of === subject.id && w.seenBy.includes(mind.id),
  );
  const start = mind.minds?.[subject.id] ?? {};
  const fromActs = seen.reduce(
    (b, w) => seenIn(mind, b, w, clear).reduce((acc, s) => fold(mind, acc, s, now), b),
    start,
  );
  if (!keeps(mind, 'low') || !inSight(mind, subject)) return fromActs;
  return readings(subject, clear).reduce((b, s) => fold(mind, b, s, now), fromActs);
}

/** Everyone standing takes in what they saw this exchange; the round's witnesses are let go. */
export function beliefsAfter(round: Round): Round {
  const fighters = round.fighters.map((mind) => {
    if (!alive(mind)) return mind;
    const minds = Object.fromEntries(
      opponentsOf(round.fighters, mind).map((s) => [s.id, aboutAfter(mind, s, round)]),
    );
    const kept = Object.fromEntries(
      Object.entries(minds).filter(([, b]) => Object.keys(b).length > 0),
    );
    return Object.keys(kept).length === 0 && !mind.minds
      ? mind
      : { ...mind, minds: { ...mind.minds, ...kept } };
  });
  const { witnessed: _done, ...rest } = round;
  return { ...rest, fighters };
}
