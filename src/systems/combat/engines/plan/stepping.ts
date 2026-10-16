import type { RangeBand } from '../../contract';
import { canAttackFrom, homeBand } from '../../rules/kit';
import { inReach, RANGE_BANDS, STRIKE_REACH } from '../../rules/range';
import { hasVerb, isHarmful, isWounding, techniquePower } from '../../rules/verbs';
import { cardsFor, isFootwork, playable, type Card } from './cards';
import { moveDestination } from './footwork';
import type { PlanFighter } from './state';

/**
 * Footwork without a slot. A fighter makes for the distance they fight at (`keepAt`) by a move
 * technique that lands there, else a step the foe contests; with nowhere set, they step home
 * only when nothing slotted does anything where they stand and a clearly stronger attack waits
 * there, and otherwise fall back on a plain blow. A step always costs the turn.
 */

/** A plain blow's weight against techniques' power, for weighing where to stand. */
const STRIKE_POWER = 8;
/** A step costs a turn and may fail: it's only worth it for a clearly better attack. */
export const STEP_WORTH = 1.25;

/** The hardest-hitting attack the kit has at a distance, as technique power. */
export function bestAttack(fighter: PlanFighter, band: RangeBand): number {
  if (!canAttackFrom(fighter, band)) return 0;
  const powers = cardsFor(fighter, band).flatMap((c) =>
    c.kind === 'jutsu' && isWounding(c.technique) ? [techniquePower(c.technique)] : [],
  );
  return Math.max(0, ...powers, inReach(STRIKE_REACH, band) ? STRIKE_POWER : 0);
}

function stepTowards(band: RangeBand, goal: RangeBand): Card {
  const further = RANGE_BANDS.indexOf(goal) > RANGE_BANDS.indexOf(band);
  return { kind: 'step', direction: further ? 'back' : 'in' };
}

/** What takes this fighter towards a distance: a move technique that lands there, or a step. */
export function footworkTowards(fighter: PlanFighter, band: RangeBand, goal: RangeBand): Card {
  const flicker = fighter.techniques.find((technique) => {
    const card: Card = { kind: 'jutsu', technique };
    return (
      isFootwork(card) && moveDestination(fighter, technique) === goal && playable(fighter, card)
    );
  });
  return flicker ? { kind: 'jutsu', technique: flicker } : stepTowards(band, goal);
}

/**
 * An entry: a technique that carries its user in to strike (a flying kick), so it attacks from
 * where it lands. Played from further off it is a charge, and meets a hold-off as a step does.
 */
export function isEntry(fighter: PlanFighter, card: Card, band: RangeBand): boolean {
  if (card.kind !== 'jutsu' || !isHarmful(card.technique)) return false;
  const to = moveDestination(fighter, card.technique);
  if (to === null || RANGE_BANDS.indexOf(to) >= RANGE_BANDS.indexOf(band)) return false;
  return canAttackFrom(fighter, to);
}

/** Whether a card attacks from here: the kit reaches from this distance, or it is an entry. */
export function attacksFrom(fighter: PlanFighter, card: Card, band: RangeBand): boolean {
  return canAttackFrom(fighter, band) || isEntry(fighter, card, band);
}

/**
 * What a fighter making for another distance plays before the footwork: a preparation (an
 * empower, clones) while none holds, or an entry that takes them where they are going.
 */
export function readiesTheCharge(fighter: PlanFighter, card: Card, band: RangeBand): boolean {
  const goal = fighter.keepAt;
  if (goal === undefined || goal === band || card.kind !== 'jutsu') return false;
  const prepares = hasVerb(card.technique, 'empower') || hasVerb(card.technique, 'clone');
  const lands = moveDestination(fighter, card.technique) === goal;
  return prepares || (isEntry(fighter, card, band) && lands);
}

/** The footwork a fighter plays before their slots: towards where they fight, if elsewhere. */
export function makingFor(fighter: PlanFighter, band: RangeBand): Card | null {
  const goal = fighter.keepAt;
  return goal === undefined || goal === band ? null : footworkTowards(fighter, band, goal);
}

/**
 * With nothing slotted to play: home, when the kit can't attack from here or a clearly
 * stronger attack waits there; else a plain blow up close or a kunai from further off.
 */
export function improvise(self: PlanFighter, band: RangeBand): Card {
  const home = homeBand(self);
  const reaches = canAttackFrom(self, band);
  const better = bestAttack(self, home) > bestAttack(self, band) * STEP_WORTH;
  if (band !== home && (!reaches || better)) return footworkTowards(self, band, home);
  return band === 'close' ? { kind: 'strike' } : { kind: 'throw' };
}

/**
 * Whether a kit fights from one distance: its best attack anywhere else is clearly weaker
 * than at home (a brawler with only fists and kicks), so it makes for home before anything.
 */
export function fightsFromHome(fighter: PlanFighter, home: RangeBand): boolean {
  const there = bestAttack(fighter, home);
  return RANGE_BANDS.every((b) => b === home || bestAttack(fighter, b) * STEP_WORTH < there);
}
