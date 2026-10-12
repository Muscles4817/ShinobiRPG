import type { Verb } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../../contract';
import { canAttackFrom, hasTrait, homeBand } from '../../rules/kit';
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

/** A plain blow's weight against techniques' power, for weighing where to stand. */
const STRIKE_POWER = 8;
/** A step costs a turn and may fail: it goes first only for a clearly better attack. */
const STEP_WORTH = 1.25;

/** The hardest-hitting attack the kit has at a distance, as technique power. */
function bestAttack(fighter: PlanFighter, band: RangeBand): number {
  const jutsu = damageJutsu(cardsFor(fighter, band))[0];
  const power = jutsu?.kind === 'jutsu' ? techniquePower(jutsu.technique) : 0;
  return Math.max(power, inReach(STRIKE_REACH, band) ? STRIKE_POWER : 0);
}

/**
 * Whether a fighter should spend their turn moving towards home: first when their kit can't
 * attack from here or a clearly stronger attack waits at home; otherwise after their attacks
 * (a step hands the foe a free turn, so the plan fights with what reaches and lets a foe who
 * closes in come to it).
 */
function footworkFor(fighter: PlanFighter, band: RangeBand, home: RangeBand): Footwork {
  if (band === home) return 'none';
  if (!canAttackFrom(fighter, band)) return 'first';
  return bestAttack(fighter, home) > bestAttack(fighter, band) * STEP_WORTH
    ? 'first'
    : 'after-attacks';
}

/** Whom the plan is made against, as far as it is known. */
interface Facing {
  /** Some foe fights with jutsu, so a seal has something to lock; true when unknown. */
  readonly foeJutsu: boolean;
  /** Some foe is far stronger: the trump goes first rather than last. */
  readonly outmatched: boolean;
  /** Fighting to set the others up (a teammate in support): a hold whatever the foe. */
  readonly support: boolean;
  /** Some foe fights from hiding (an illusionist, or hidden already): bring a Search. */
  readonly foeHides: boolean;
}

/** A hold slotted ahead of the attacks, or behind the best jutsu. */
interface Hold {
  readonly early: Slot[];
  readonly late: Slot[];
}

/**
 * A hold (daze, seal or confusion) to spoil a telegraphed jutsu, when some foe fights with
 * jutsu: against blows alone the slot would never play. Only then: a hold played at any moment
 * costs a turn that a blow would have used better. Every hold waits behind the best wounding
 * jutsu: a daze trades your turn for theirs, may be seen coming, and can't be chained (the
 * target is steady after one), so leading with it loses fights; a teammate in support, whose
 * job is setting the others up, is the exception.
 */
function holdSlot(pool: readonly Card[], facing: Facing): Hold {
  const [hold] = facing.foeJutsu || facing.support ? strongest(pool, isHindering) : [];
  if (hold?.kind !== 'jutsu') return { early: [], late: [] };
  const slot: Slot = { card: cardId(hold), when: 'foe-readying' };
  // Only a teammate in support leads with the hold: a daze trades your turn for theirs and
  // may be seen coming, so on your own it follows your best attack.
  return facing.support ? { early: [slot], late: [] } : { early: [], late: [slot] };
}

/**
 * How to find a hidden foe: a sense technique when the kit has one, else, against a foe known
 * to hide, a Search (a plan with neither can't touch an illusionist at all).
 */
function finding(senses: readonly Card[], search: readonly Card[], facing: Facing): Slot[] {
  const by = senses.length > 0 ? senses : facing.foeHides ? search.slice(0, 1) : [];
  return by.map((c): Slot => ({ card: cardId(c), when: 'foe-hidden' }));
}

/** The strongest trump that does something to a foe: kept for the last ditch, unless outmatched. */
function trumpSlot(trumps: readonly Card[], facing: Facing): Slot[] {
  const [trump] = strongest(trumps, isHarmful);
  if (!trump) return [];
  return [
    facing.outmatched ? { card: cardId(trump) } : { card: cardId(trump), when: 'low-health' },
  ];
}

/**
 * The slots that fit, always keeping a defence when the kit has one: a Guard or Dodge costs no
 * turn and no chakra, it reacts to every hit, and a plan without one loses to a plan with one
 * far more often than any third attack wins back (the content bench measures it).
 */
function fitted(ordered: readonly Slot[], defences: readonly Slot[], limit: number): Slot[] {
  const unique = ordered.filter((slot, i) => ordered.findIndex((s) => s.card === slot.card) === i);
  const kept = unique.slice(0, limit);
  const isDefence = (slot: Slot) => defences.some((d) => d.card === slot.card);
  const defence = unique.find(isDefence);
  if (!defence || limit < 2 || kept.some(isDefence)) return kept;
  return [...kept.slice(0, limit - 1), defence];
}

/**
 * A sensible starting plan, in priority order: a heal for when you're badly hurt, a trump for
 * the last ditch (or first, against a far stronger foe), a sense or Search for when a foe hides,
 * a field to set the ground (it plays only while none of yours is up), footwork towards where you
 * fight best (when it's worth a turn; a move technique rather than a step), an empower or clones
 * and a trap where you can attack (the plan passes over them while they hold), your best attack,
 * a hold (see `holdSlot`), then plain blows, more attacks and a conceal; the last slot is always
 * a defence (a substitution, a Guard or a Dodge: see `fitted`). Attacks your kit can't make from
 * a distance (an archer up close) are left out.
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
  // Reactions, best first: a substitution, then a Guard, then a Dodge.
  const defences = plain([...best('substitute'), ...has('guard'), ...has('dodge')]);
  const ordered: Slot[] = [
    ...best('heal').map((c): Slot => ({ card: cardId(c), when: 'low-health' })),
    ...trump,
    ...finding(best('sense'), has('search'), facing),
    ...plain([...best('field'), ...at('first')]),
    ...hold.early,
    ...plain(reaches ? [...ready, ...best('trap')] : []),
    ...plain(damage.slice(0, 1)),
    ...hold.late,
    ...plain([...has('strike'), ...has('throw'), ...at('after-attacks')]),
    ...plain([...damage.slice(1), ...best('conceal')]),
    ...defences,
  ];
  return fitted(ordered, defences, slotLimit(fighter));
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
    foeHides: foes.some((f) => f.hidden || hasTrait(f, 'illusionist')),
  };
  const [close, mid, far] = RANGE_BANDS.map((band) => defaultFor(fighter, band, home, facing));
  return { close: close ?? [], mid: mid ?? [], far: far ?? [] };
}
