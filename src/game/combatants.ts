import type { EnemyDef } from '@/content';
import type { CombatantSetup, CombatAttributes } from '@/systems/combat';
import { createStats, type Stats } from '@/systems/stats';
import { maxChakra, maxHealth } from '@/systems/vitals';

import type { GameContext } from './context';
import type { GameState } from './state';

/** Translates game entities into the combat contract's vocabulary. */

function attributesOf(stats: Stats): CombatAttributes {
  const { strength, speed, stamina, perception, willpower, taijutsu, ninjutsu, genjutsu } = stats;
  return { strength, speed, stamina, perception, willpower, taijutsu, ninjutsu, genjutsu };
}

export function playerCombatant(state: GameState, ctx: GameContext): CombatantSetup {
  const { name, stats, vitals } = state.character;
  return {
    id: 'player',
    name,
    attributes: attributesOf(stats),
    health: vitals.health,
    maxHealth: maxHealth(stats),
    chakra: vitals.chakra,
    maxChakra: maxChakra(stats),
    techniques: state.techniques.known.map((id) => ctx.content.techniques.require(id)),
  };
}

export function enemyCombatant(def: EnemyDef, index: number, ctx: GameContext): CombatantSetup {
  return {
    id: `${def.id}#${index}`,
    name: def.name,
    tag: def.kind,
    attributes: attributesOf(createStats(def.baseStat, def.statBonuses)),
    health: def.maxHealth,
    maxHealth: def.maxHealth,
    chakra: def.maxChakra,
    maxChakra: def.maxChakra,
    techniques: def.techniqueIds.map((id) => ctx.content.techniques.require(id)),
  };
}
