import type { CombatTechnique } from '../../contract';
import { hasVerb, techniquePower } from '../../rules/verbs';
import { cardId, findCard, type Card } from './cards';
import { plainSlots, type PlanFighter, type Slot } from './state';

/**
 * What one card does for another, read from what techniques are, never from their names: a
 * card may need something true of the fight before it does its work (a finisher needs a foe who
 * can't move), and another card may make it true (a daze or a pin leaves a foe open). A default
 * plan that slots the first without the second never plays the first, so `withEnablers` slots
 * the kit's best way of making it true right behind it: the needing card plays whenever its need
 * holds, and otherwise the enabling one makes it hold.
 *
 * A new kind of need is a row in each table. Ladders (`climbing.ts`), summons a technique needs
 * out (`calling.ts`) and the set-up killer's hide, hold and finish (`setups.ts`, `kitSlots.ts`)
 * are enabled from the kit already, so they aren't here.
 */

/** Something a card may need true of the fight. */
export type Need = 'foe-open';

/** What a technique needs before it does its work. */
const NEEDS: Readonly<Record<Need, (t: CombatTechnique) => boolean>> = {
  // A finisher waits for a dazed or held foe (`finishers.ts`).
  'foe-open': (t) => t.needsTarget === 'open',
};

/** What a technique makes true. */
const MAKES: Readonly<Record<Need, (t: CombatTechnique) => boolean>> = {
  // A daze leaves its target open; so does a pin (`finishers.ts`, `isOpen`).
  'foe-open': (t) => hasVerb(t, 'daze') || hasVerb(t, 'pin'),
};

const NEED_IDS = Object.keys(NEEDS) as Need[];

function techniqueOf(card: Card | null): CombatTechnique | undefined {
  return card?.kind === 'jutsu' ? card.technique : undefined;
}

/** The needs a card has. */
export function needsOf(card: Card | null): Need[] {
  const t = techniqueOf(card);
  return t ? NEED_IDS.filter((need) => NEEDS[need](t)) : [];
}

/** What a card makes true. A card that needs the thing itself doesn't count as making it. */
export function makesOf(card: Card | null): Need[] {
  const t = techniqueOf(card);
  return t ? NEED_IDS.filter((need) => MAKES[need](t) && !NEEDS[need](t)) : [];
}

/** The strongest card in the pool that makes this true. */
function bestMaker(pool: readonly Card[], need: Need): Card | undefined {
  const power = (c: Card) => {
    const t = techniqueOf(c);
    return t ? techniquePower(t) : 0;
  };
  return pool.filter((c) => makesOf(c).includes(need)).sort((a, b) => power(b) - power(a))[0];
}

/**
 * The plan with an enabler slotted right behind each card whose need nothing earlier in the plan
 * makes true, when the pool has one. Nothing is removed or reordered.
 */
export function withEnablers(
  fighter: PlanFighter,
  ordered: readonly Slot[],
  pool: readonly Card[],
): Slot[] {
  const made = new Set<Need>();
  return ordered.flatMap((slot): Slot[] => {
    const card = findCard(fighter, slot.card);
    const missing = needsOf(card).filter((need) => !made.has(need));
    const enablers = missing.flatMap((need) => {
      const maker = bestMaker(pool, need);
      return maker ? [maker] : [];
    });
    // A slot that waits on a condition (a hold kept for a foe readying a jutsu) can't be counted
    // on to make anything; one that plays whenever it can, can.
    const sure = slot.when === undefined ? [card] : [];
    for (const c of [...sure, ...enablers]) for (const need of makesOf(c)) made.add(need);
    return [slot, ...plainSlots(enablers.map(cardId))];
  });
}
