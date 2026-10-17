import type { CombatantSetup, CombatOutcome } from '@/systems/combat';
import {
  hungerFightScale,
  hungerOf,
  KNOCKED_DOWN_DAYS,
  laidUp,
  ordersOpen,
} from '@/systems/companions';
import { STAT_IDS, type Stats } from '@/systems/stats';

import { attributesOf } from '../combatants';
import type { GameContext } from '../context';
import { log } from '../ops';
import type { GameState } from '../state';
import { withCompanion, yourCompanion } from './care';
import { maxHealthOf } from './make';

/**
 * Your companion in a fight: one more fighter on your side (it hits no harder for being
 * yours), at the health it has now and weaker when hungry, taking only the orders your bond has
 * earned (`ordersOpen`). A companion laid up stays home. Knocked down, it is injured.
 */

const PREFIX = 'companion:';

/** Whether a combatant id is someone's companion (not a teammate). */
export function isCompanionCombatant(id: string): boolean {
  return id.startsWith(PREFIX);
}

function scaled(stats: Stats, scale: number): Stats {
  if (scale === 1) return stats;
  return Object.fromEntries(STAT_IDS.map((id) => [id, stats[id] * scale])) as Stats;
}

/** Your companion as a fighter beside you, or none (none at all, or laid up). */
export function companionAllies(state: GameState, ctx: GameContext): CombatantSetup[] {
  const yours = yourCompanion(state, ctx);
  if (!yours || laidUp(yours.companion, state.time.day)) return [];
  const { companion, kind } = yours;
  const open = ordersOpen(companion.bond, kind.temperament);
  const notYet = `${companion.name} doesn’t take that from you yet. Spend more time together.`;
  const hunger = hungerFightScale(hungerOf(companion, state.time.day));
  return [
    {
      id: `${PREFIX}${companion.id}`,
      name: companion.name,
      tag: kind.name,
      attributes: attributesOf(scaled(companion.stats, hunger)),
      health: Math.max(1, Math.round(companion.health)),
      maxHealth: maxHealthOf(kind),
      chakra: kind.maxChakra,
      maxChakra: kind.maxChakra,
      techniques: [],
      ...(kind.traits ? { traits: kind.traits } : {}),
      orders: {
        ...(open.stance ? {} : { stanceLocked: notYet }),
        ...(open.cards ? {} : { cardsLocked: notYet }),
      },
    },
  ];
}

/** What's left of a companion knocked down in a spar: spars stop before anyone is hurt. */
const SPARRED_DOWN_HEALTH = 1;

/**
 * Your companion after a fight it was in: its health kept, and an injury if it went down in
 * earnest (a spar stops before anyone is really hurt).
 */
export function afterCompanionFight(
  state: GameState,
  outcome: CombatOutcome,
  ctx: GameContext,
  sparring: boolean,
): GameState {
  const yours = yourCompanion(state, ctx);
  const after = yours && outcome.allies?.[`${PREFIX}${yours.companion.id}`];
  if (!yours || !after) return state;
  const health = sparring ? Math.max(SPARRED_DOWN_HEALTH, after.health) : after.health;
  if (health > 0) return withCompanion(state, { ...yours.companion, health });
  const injury = { until: state.time.day + KNOCKED_DOWN_DAYS, treated: false, dosedDay: null };
  const hurt = withCompanion(state, { ...yours.companion, health: 0, injury });
  return log(hurt, {
    heading: `${yours.companion.name} is hurt`,
    text: `${yours.companion.name} went down in the fight and limps home. It needs rest, and a vet would help.`,
    tone: 'warning',
  });
}
