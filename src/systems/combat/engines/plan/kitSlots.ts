import type { CombatTechnique } from '../../contract';
import { hasVerb, opensOf } from '../../rules/verbs';
import { cardId, type Card } from './cards';
import { fightsBySummons } from './calling';
import { callsOf } from './calls';
import { climbOrder, isStill } from './climbing';
import { setsUp } from './setups';
import { plainSlots, type PlanFighter, type Slot } from './state';

/**
 * The player's plan is theirs (`plannedPlay` in `priority.ts`): for them the kit never plays
 * itself, so their default plan slots what it would have played, where they can see it and
 * change it: a set-up's killing blow for a dazed foe, a ladder's next openings, the meditation
 * into Sage Mode, a summoner's calls, and the rest of the set-up (out of sight, then the hold).
 * Fighters the game plays keep fighting from the kit, slot or no slot.
 */

/** How many of a ladder's openings the plan slots: enough to climb, not crowd out attacks. */
const LADDER_SLOTS = 2;
/** How many of a summoner's calls the plan slots. */
const CALL_SLOTS = 2;

function jutsuIn(usable: readonly Card[], test: (t: CombatTechnique) => boolean): Card[] {
  return usable.filter((c) => c.kind === 'jutsu' && test(c.technique));
}

const killing = (t: CombatTechnique) => t.lethal === true;
const holding = (t: CombatTechnique) => !killing(t) && (hasVerb(t, 'daze') || hasVerb(t, 'pin'));
const hiding = (t: CombatTechnique) => hasVerb(t, 'conceal');

/** A ladder's openings in the order they climb, as far as the plan has room for. */
function openings(fighter: PlanFighter, usable: readonly Card[]): Card[] {
  const order = climbOrder(fighter.techniques).map((t) => t.id);
  return order.flatMap((id) => jutsuIn(usable, (t) => t.id === id)).slice(0, LADDER_SLOTS);
}

/** The slots that stand in for the kit's own plays, for the player's default plan. */
export function kitSlots(fighter: PlanFighter, usable: readonly Card[]): Slot[] {
  const setup = setsUp(fighter);
  const kill = setup ? jutsuIn(usable, killing).slice(0, 1) : [];
  const meditation = jutsuIn(usable, (t) => isStill(t) && opensOf(t) !== undefined);
  const calls = fightsBySummons(fighter)
    ? jutsuIn(usable, (t) => callsOf(t).length > 0).slice(0, CALL_SLOTS)
    : [];
  const unseen = setup
    ? [...jutsuIn(usable, hiding).slice(0, 1), ...jutsuIn(usable, holding).slice(0, 1)]
    : [];
  return [
    // The killing blow waits for a foe who can't move (`rules/lethal.ts`).
    ...kill.map((c): Slot => ({ card: cardId(c), when: 'foe-dazed' })),
    ...plainSlots([...openings(fighter, usable), ...meditation, ...calls, ...unseen].map(cardId)),
  ];
}
