import type { CombatantSetup, CombatOutcome } from '@/systems/combat';
import {
  hungerFightScale,
  hungerOf,
  KNOCKED_DOWN_DAYS,
  laidUp,
  oldEnoughToFight,
  ordersOpen,
} from '@/systems/companions';
import { STAT_IDS, type Stats } from '@/systems/stats';

import { attributesOf } from '../combatants';
import type { GameContext } from '../context';
import { log } from '../ops';
import type { GameState } from '../state';
import { knownTechniques } from './arts';
import { stageOfLife } from './body';
import { withCompanion, yourCompanion } from './care';
import { maxHealthOf } from './make';

/**
 * Your companion in a fight: one more fighter on your side (it hits no harder for being
 * yours), at the health it has now and weaker when hungry, with the techniques its bond has
 * opened (`arts.ts`), taking only the orders your bond has earned (`ordersOpen`). A companion laid up stays home, and so does a pup too young to fight.
 * Knocked down, it is injured.
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

/** Whether your companion comes with you to fight today: not laid up, and old enough. */
export function fitToFight(state: GameState, ctx: GameContext): boolean {
  const yours = yourCompanion(state, ctx);
  if (!yours || laidUp(yours.companion, state.time.day)) return false;
  return oldEnoughToFight(stageOfLife(yours.companion, yours.kind));
}

/** Your companion as a fighter beside you, or none (none at all, laid up, or too young). */
export function companionAllies(state: GameState, ctx: GameContext): CombatantSetup[] {
  const yours = yourCompanion(state, ctx);
  if (!yours || !fitToFight(state, ctx)) return [];
  const { companion, kind } = yours;
  const open = ordersOpen(companion.bond, kind.temperament);
  const notYet = `${companion.name} doesn’t take that from you yet. Spend more time together.`;
  const hunger = hungerFightScale(hungerOf(companion, state.time.day));
  return [
    {
      id: `${PREFIX}${companion.id}`,
      name: companion.name,
      grammar: 'it',
      tag: kind.name,
      attributes: attributesOf(scaled(companion.stats, hunger)),
      health: Math.max(1, Math.round(companion.health)),
      maxHealth: maxHealthOf(kind),
      chakra: kind.maxChakra,
      maxChakra: kind.maxChakra,
      techniques: knownTechniques(companion, kind).map((id) => ctx.content.techniques.require(id)),
      ...(kind.traits ? { traits: kind.traits } : {}),
      orders: {
        ...(open.stance ? {} : { stanceLocked: notYet }),
        ...(open.cards ? {} : { cardsLocked: notYet }),
      },
    },
  ];
}

/**
 * Your companion after a fight it was in: its health kept, and an injury if it went down. (It
 * stays out of spars: a spar is one against one.)
 */
export function afterCompanionFight(
  state: GameState,
  outcome: CombatOutcome,
  ctx: GameContext,
): GameState {
  const yours = yourCompanion(state, ctx);
  const after = yours && outcome.allies?.[`${PREFIX}${yours.companion.id}`];
  if (!yours || !after) return state;
  const health = after.health;
  if (health > 0) return withCompanion(state, { ...yours.companion, health });
  const injury = { until: state.time.day + KNOCKED_DOWN_DAYS, treated: false, dosedDay: null };
  const hurt = withCompanion(state, { ...yours.companion, health: 0, injury });
  return log(hurt, {
    heading: `${yours.companion.name} is hurt`,
    text: `${yours.companion.name} went down in the fight and limps home. It needs rest, and a vet would help.`,
    tone: 'warning',
  });
}
