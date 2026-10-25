import { hashUnit } from '@/core';
import type { EnemyDef } from '@/content';
import type { CombatItemEffect } from '@/systems/combat';

import type { GameContext } from './context';
import { glanceOdds, type RetinueKnowledge } from './retinueSight';
import type { PoolNote } from './scoutingPools';
import type { GameState } from './state';

/**
 * What a read says of the gear and tools a foe carries (`EnemyDef.carries`): what they wear
 * shows at a glance; what is in their pouch is kept, and a glance may miss it (perception, by
 * hash, as for a companion kept out of sight). In a fight, or from a client's report, all of it.
 */

/** What each kind of tool in a foe's pouch means for you. */
const TOOL_COUNTERS: Readonly<Record<CombatItemEffect, string>> = {
  smoke: 'They can vanish in smoke; a flash or a search brings them back into sight.',
  flash: 'A flash shows anyone hiding, you included.',
  blast: 'A sealed blast that armour does nothing to blunt.',
  chakra: 'A pill to refill their chakra: a long fight favours them.',
  heal: 'A salve to close their wounds once.',
  clarity: 'A charm that clears an illusion from their head.',
};

function gearNotes(def: EnemyDef, ctx: GameContext): PoolNote[] {
  return (def.carries?.gearIds ?? []).flatMap((id) => {
    const gear = ctx.content.gear.get(id);
    return gear ? [{ label: gear.name, counter: gear.description }] : [];
  });
}

function pouchNotes(def: EnemyDef, ctx: GameContext): PoolNote[] {
  return Object.keys(def.carries?.tools ?? {}).flatMap((id) => {
    const tool = ctx.content.tools.get(id);
    return tool ? [{ label: tool.name, counter: TOOL_COUNTERS[tool.effect] }] : [];
  });
}

/** Whether you can tell what is in a foe's pouch. */
function pouchSeen(state: GameState, def: EnemyDef, knowledge: RetinueKnowledge): boolean {
  if (knowledge === 'full') return true;
  const perception = state.character.stats.perception;
  return hashUnit(state.board.seed, 'pouch', def.id) < glanceOdds('kept', perception);
}

/** Notes on the gear a foe wears and, when you can tell, the tools they carry. */
export function carriedNotes(
  state: GameState,
  ctx: GameContext,
  def: EnemyDef,
  knowledge: RetinueKnowledge,
): PoolNote[] {
  return [
    ...gearNotes(def, ctx),
    ...(pouchSeen(state, def, knowledge) ? pouchNotes(def, ctx) : []),
  ];
}
