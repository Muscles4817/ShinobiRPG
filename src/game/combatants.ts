import type { EnemyDef } from '@/content';
import type { CombatantSetup, CombatAttributes, CombatPerk } from '@/systems/combat';
import { createStats, type Stats } from '@/systems/stats';
import { maxChakra, maxHealth } from '@/systems/vitals';

import type { GameContext } from './context';
import { combatStats } from './gear';
import type { GameState } from './state';

/** Translates game entities into the combat contract's vocabulary. */

export function attributesOf(stats: Stats): CombatAttributes {
  const { strength, speed, stamina, chakraControl, intellect, perception, willpower } = stats;
  const { taijutsu, ninjutsu, genjutsu, kenjutsu, fuuinjutsu } = stats;
  return {
    strength,
    speed,
    stamina,
    chakraControl,
    intellect,
    perception,
    willpower,
    taijutsu,
    ninjutsu,
    genjutsu,
    kenjutsu,
    fuuinjutsu,
  };
}

/** An awakened bloodline lets you read opponents ("insight"); dormant ones do nothing yet. */
function perksOf(state: GameState, ctx: GameContext): CombatPerk[] {
  const bloodline = ctx.content.clans.get(state.character.clanId)?.kekkeiGenkai;
  return bloodline && !bloodline.dormant ? ['insight'] : [];
}

export function playerCombatant(state: GameState, ctx: GameContext): CombatantSetup {
  const { name, stats, vitals, nature } = state.character;
  const armed = combatStats(state, ctx);
  return {
    id: 'player',
    name,
    attributes: attributesOf(armed),
    health: vitals.health,
    maxHealth: maxHealth(stats),
    chakra: vitals.chakra,
    maxChakra: maxChakra(stats),
    techniques: state.techniques.known.map((id) => ctx.content.techniques.require(id)),
    nature,
    perks: perksOf(state, ctx),
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
    ...(def.nature ? { nature: def.nature } : {}),
  };
}
