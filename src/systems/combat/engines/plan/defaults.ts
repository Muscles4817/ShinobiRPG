import type { Verb } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../../contract';
import { hasPerk } from '../../rules/body';
import { canAttackFrom, hasTrait, homeBand } from '../../rules/kit';
import { RANGE_BANDS } from '../../rules/range';
import { isTrump, outmatched } from '../../rules/trumps';
import { hasVerb, isHarmful, isHindering, isWounding, techniquePower } from '../../rules/verbs';
import { cardBlocked, cardId, cardsFor, isOffence, slotLimit, type Card } from './cards';
import { opponentsOf } from './senses';
import { defaultHoldOff } from './zoning';
import { defaultReactions } from './readiness';
import { fightsFromHome, isEntry } from './stepping';
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
 * The slots that fit. A small plan (a dull mind holds two actions) keeps an attack: a plan of
 * nothing but emergencies would leave its owner swinging plain blows.
 */
function fitted(ordered: readonly Slot[], attack: Slot | undefined, limit: number): Slot[] {
  const unique = ordered.filter((slot, i) => ordered.findIndex((s) => s.card === slot.card) === i);
  const kept = unique.slice(0, limit);
  if (!attack || kept.some((s) => s.card === attack.card)) return kept;
  return [...kept.slice(0, limit - 1), attack];
}

/**
 * A sensible starting plan, in priority order: a heal for when you're badly hurt, a trump for
 * the last ditch (or first, against a far stronger foe), a sense or Search for when a foe hides,
 * a field to set the ground (it plays only while none of yours is up), an empower or clones and
 * a trap where you can attack (the plan passes over them while they hold), your best attack, a
 * hold (see `holdSlot`), then more attacks and a conceal, as many as your slots hold, always
 * keeping the best attack (see `fitted`). Defences and footwork aren't slotted
 * (`readiness.ts`, `stepping.ts`). Attacks your kit can't make from a distance (an archer up
 * close) are left out.
 */
function defaultFor(fighter: PlanFighter, band: RangeBand, facing: Facing): Slot[] {
  const reaches = canAttackFrom(fighter, band);
  const usable = cardsFor(fighter, band).filter(
    (c) =>
      (reaches || !isOffence(c) || isEntry(fighter, c, band)) && cardBlocked(fighter, c) === null,
  );
  const trumps = usable.filter((c) => c.kind === 'jutsu' && isTrump(c.technique));
  const pool = usable.filter((c) => !trumps.includes(c));
  const best = (verb: Verb) => strongest(pool, (t) => hasVerb(t, verb)).slice(0, 1);
  const damage = damageJutsu(pool);
  const ready = strongest(pool, (t) => hasVerb(t, 'empower') || hasVerb(t, 'clone')).slice(0, 1);
  const plain = (cards: readonly Card[]) => plainSlots(cards.map(cardId));
  const hold = holdSlot(pool, facing);
  const search = pool.filter((c) => c.kind === 'search');
  const ordered: Slot[] = [
    ...best('heal').map((c): Slot => ({ card: cardId(c), when: 'low-health' })),
    ...(reaches ? trumpSlot(trumps, facing) : []),
    ...finding(best('sense'), search, facing),
    ...plain(best('field')),
    ...hold.early,
    // Readying (an empower, clones) is worth it anywhere: before a charge most of all.
    ...plain([...ready, ...(reaches ? best('trap') : [])]),
    ...plain(damage.slice(0, 1)),
    ...hold.late,
    ...plain([...damage.slice(1), ...best('conceal')]),
  ];
  return fitted(ordered, plain(damage.slice(0, 1))[0], slotLimit(fighter));
}

/** How a teammate's stance bends the plan (`team.ts`). */
export interface PlanShape {
  /** Where to fight: a teammate pressing in makes for a closer distance than their kit's. */
  readonly home?: RangeBand;
  /** A teammate in support keeps a hold whatever the foe, to set the others up. */
  readonly support?: boolean;
}

function facingOf(fighter: PlanFighter, among: readonly PlanFighter[], support: boolean): Facing {
  const foes = opponentsOf(among, fighter);
  return {
    foeJutsu: foes.length === 0 || foes.some((f) => f.techniques.some(isHarmful)),
    outmatched: outmatched(fighter, foes),
    support,
    // Insight sees through hiding, so it needs no Search.
    foeHides:
      !hasPerk(fighter, 'insight') && foes.some((f) => f.hidden || hasTrait(f, 'illusionist')),
  };
}

/** The default plan's actions, against the fighters in the fight when they're known. */
export function defaultLoadout(
  fighter: PlanFighter,
  among: readonly PlanFighter[] = [],
  shape: PlanShape = {},
): Loadout {
  const facing = facingOf(fighter, among, shape.support ?? false);
  const [close, mid, far] = RANGE_BANDS.map((band) => defaultFor(fighter, band, facing));
  return { close: close ?? [], mid: mid ?? [], far: far ?? [] };
}

/**
 * What the default plan keeps ready: its defences, and a distance to make for when a stance
 * sets one (a teammate pressing in) or the kit fights from one distance only (a brawler closes
 * in first, `fightsFromHome`). Anyone else fights wherever they stand and steps home only when
 * nothing they slotted does anything there (`stepping.ts`).
 */
export function defaultReadiness(
  fighter: PlanFighter,
  shape: PlanShape = {},
): Pick<PlanFighter, 'reactions' | 'keepAt' | 'holdOff'> {
  const home = shape.home ?? homeBand(fighter);
  const makesFor = home !== homeBand(fighter) || fightsFromHome(fighter, home);
  return {
    reactions: defaultReactions(fighter),
    holdOff: defaultHoldOff(fighter),
    ...(makesFor ? { keepAt: home } : {}),
  };
}
