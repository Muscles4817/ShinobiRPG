import type { Verb } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../../contract';
import { canAttackFrom, homeBand } from '../../rules/kit';
import { inReach, RANGE_BANDS, STRIKE_REACH } from '../../rules/range';
import { isTrump, outmatched } from '../../rules/trumps';
import {
  hasVerb,
  isHarmful,
  isHindering,
  isWounding,
  moveGoal,
  techniquePower,
} from '../../rules/verbs';
import { cardBlocked, cardId, cardsFor, isOffence, slotLimit, type Card } from './cards';
import { opponentsOf } from './senses';
import { plainSlots, type Loadout, type PlanFighter, type Slot } from './state';

/**
 * The plan a fighter starts with when they bring none: the player's first plan, and the cards
 * foes and teammates fight with. Built per distance from what the kit offers and, when known,
 * whom they face (no seal against a foe with no jutsu; a trump at once against a far stronger
 * foe).
 */

function strongest(pool: readonly Card[], test: (t: CombatTechnique) => boolean): Card[] {
  return pool
    .flatMap((c) => (c.kind === 'jutsu' && test(c.technique) ? [c] : []))
    .sort((a, b) => techniquePower(b.technique) - techniquePower(a.technique));
}

function damageJutsu(cards: readonly Card[]): Card[] {
  return strongest(cards, isWounding);
}

/** How much a step towards home is worth: before attacking, after, or not at all. */
type Footwork = 'first' | 'after-attacks' | 'none';

/**
 * Whether a fighter should spend their turn moving towards home: first when their kit can't
 * attack from here or more of their jutsu reach from home; after their attacks when only a full
 * blow waits at home (kunai land softer, but stepping in hands the foe the first blow, so the
 * plan keeps throwing and lets a foe who closes in come to it).
 */
function footworkFor(fighter: PlanFighter, band: RangeBand, home: RangeBand): Footwork {
  if (band === home) return 'none';
  if (!canAttackFrom(fighter, band)) return 'first';
  const jutsuAtHome = damageJutsu(cardsFor(fighter, home)).length;
  if (jutsuAtHome > damageJutsu(cardsFor(fighter, band)).length) return 'first';
  return inReach(STRIKE_REACH, home) && !inReach(STRIKE_REACH, band) ? 'first' : 'none';
}

/** Whom the plan is made against, as far as it is known. */
interface Facing {
  /** Some foe fights with jutsu, so a seal has something to lock; true when unknown. */
  readonly foeJutsu: boolean;
  /** Some foe is far stronger: the trump goes first rather than last. */
  readonly outmatched: boolean;
  /** Fighting to set the others up (a teammate in support): a hold whatever the foe. */
  readonly support: boolean;
}

/** A hold slotted ahead of the attacks, or behind the best jutsu. */
interface Hold {
  readonly early: Slot[];
  readonly late: Slot[];
}

/**
 * A hold (daze, seal or confusion) to spoil a telegraphed jutsu, when some foe fights with
 * jutsu: against blows alone the slot would never play. Only then: a hold played at any moment
 * costs a turn that a blow would have used better. A daze costs the foe their whole turn, so it
 * goes ahead of the attacks; a seal leaves them their blows and a confusion only sometimes
 * spoils a turn, so they wait behind the best wounding jutsu (the hold bench measures both).
 */
function holdSlot(pool: readonly Card[], facing: Facing): Hold {
  const [hold] = facing.foeJutsu || facing.support ? strongest(pool, isHindering) : [];
  if (hold?.kind !== 'jutsu') return { early: [], late: [] };
  const slot: Slot = { card: cardId(hold), when: 'foe-readying' };
  return hasVerb(hold.technique, 'daze') || facing.support
    ? { early: [slot], late: [] }
    : { early: [], late: [slot] };
}

/** The strongest trump that does something to a foe: kept for the last ditch, unless outmatched. */
function trumpSlot(trumps: readonly Card[], facing: Facing): Slot[] {
  const [trump] = strongest(trumps, isHarmful);
  if (!trump) return [];
  return [
    facing.outmatched ? { card: cardId(trump) } : { card: cardId(trump), when: 'low-health' },
  ];
}

function isDefence(slot: Slot): boolean {
  return slot.card === 'guard' || slot.card === 'dodge';
}

/**
 * The slots that fit, keeping a defence when a hold or a trump took its place: those play only
 * now and then, and a plan with no guard at all loses more than a hold wins back.
 */
function fitted(ordered: readonly Slot[], extras: readonly Slot[], limit: number): Slot[] {
  const unique = ordered.filter((slot, i) => ordered.findIndex((s) => s.card === slot.card) === i);
  const kept = unique.slice(0, limit);
  const defence = unique.find(isDefence);
  const crowded = extras.some((e) => kept.some((k) => k.card === e.card));
  if (!crowded || !defence || kept.some(isDefence)) return kept;
  return [...kept.slice(0, limit - 1), defence];
}

/**
 * A sensible starting plan, in priority order: a heal for when you're badly hurt, a trump for
 * the last ditch (or first, against a far stronger foe), a sense for when a foe hides, a field
 * to set the ground (it plays only while none of yours is up), footwork towards where you fight
 * best (when it's worth a turn; a move technique rather than a step), a hold (see `holdSlot`),
 * an empower or clones and a trap where you can attack (the plan passes over them while they
 * hold), your best attack, then plain blows, more attacks, a conceal, a substitution and a
 * defence. Attacks your kit can't make from a distance (an archer up close) are left out.
 */
function defaultFor(fighter: PlanFighter, band: RangeBand, home: RangeBand, facing: Facing) {
  const reaches = canAttackFrom(fighter, band);
  const usable = cardsFor(fighter, band).filter(
    (c) => (reaches || !isOffence(c)) && cardBlocked(fighter, c) === null,
  );
  const trumps = usable.filter((c) => c.kind === 'jutsu' && isTrump(c.technique));
  const pool = usable.filter((c) => !trumps.includes(c));
  const has = (kind: Card['kind']) => pool.filter((c) => c.kind === kind);
  const towardsHome = RANGE_BANDS.indexOf(band) > RANGE_BANDS.indexOf(home) ? 'in' : 'back';
  const footwork = footworkFor(fighter, band, home);
  const step = has('step').filter((c) => c.kind === 'step' && c.direction === towardsHome);
  const flicker = strongest(pool, (t) => moveGoal(t, home) === home).slice(0, 1);
  const at = (when: Footwork) => (footwork === when ? [...flicker, ...step].slice(0, 1) : []);
  const best = (verb: Verb) => strongest(pool, (t) => hasVerb(t, verb)).slice(0, 1);
  const damage = damageJutsu(pool);
  const ready = strongest(pool, (t) => hasVerb(t, 'empower') || hasVerb(t, 'clone')).slice(0, 1);
  const plain = (cards: readonly Card[]) => plainSlots(cards.map(cardId));
  const trump = reaches ? trumpSlot(trumps, facing) : [];
  const hold = holdSlot(pool, facing);
  const ordered: Slot[] = [
    ...best('heal').map((c): Slot => ({ card: cardId(c), when: 'low-health' })),
    ...trump,
    ...best('sense').map((c): Slot => ({ card: cardId(c), when: 'foe-hidden' })),
    ...plain([...best('field'), ...at('first')]),
    ...hold.early,
    ...plain(reaches ? [...ready, ...best('trap')] : []),
    ...plain(damage.slice(0, 1)),
    ...hold.late,
    ...plain([...has('strike'), ...has('throw'), ...at('after-attacks')]),
    ...plain([...damage.slice(1), ...best('conceal'), ...best('substitute')]),
    ...plain([...has('guard'), ...has('dodge')]),
  ];
  return fitted(ordered, trump, slotLimit(fighter));
}

/** How a teammate's stance bends the plan (`team.ts`). */
export interface PlanShape {
  /** Where to fight: a teammate pressing in plans around a closer distance than their kit's. */
  readonly home?: RangeBand;
  /** A teammate in support keeps a hold whatever the foe, to set the others up. */
  readonly support?: boolean;
}

/** The default plan, against the fighters in the fight when they're known. */
export function defaultLoadout(
  fighter: PlanFighter,
  among: readonly PlanFighter[] = [],
  shape: PlanShape = {},
): Loadout {
  const foes = opponentsOf(among, fighter);
  const home = shape.home ?? homeBand(fighter);
  const facing: Facing = {
    foeJutsu: foes.length === 0 || foes.some((f) => f.techniques.some(isHarmful)),
    outmatched: outmatched(fighter, foes),
    support: shape.support ?? false,
  };
  const [close, mid, far] = RANGE_BANDS.map((band) => defaultFor(fighter, band, home, facing));
  return { close: close ?? [], mid: mid ?? [], far: far ?? [] };
}
