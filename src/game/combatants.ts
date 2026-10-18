import type { EnemyDef } from '@/content';
import type {
  CombatantSetup,
  CombatAttributes,
  CombatItem,
  CombatOutcome,
  CombatPerk,
  CombatProvision,
  CombatTechnique,
} from '@/systems/combat';
import type { MealQuality } from '@/systems/cooking';
import { restockPouch } from '@/systems/inventory';
import { createStats, type Stats } from '@/systems/stats';
import { maxChakra, MAX_HEALTH, reservesFor } from '@/systems/vitals';

import type { GameContext } from './context';
import { enemyWalking, playerWalking } from './footing';
import { combatGear, combatStats } from './gear';
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
export function hasInsight(state: GameState, ctx: GameContext): boolean {
  const bloodline = ctx.content.clans.get(state.character.clanId)?.kekkeiGenkai;
  return !!bloodline && !bloodline.dormant;
}

function perksOf(state: GameState, ctx: GameContext): CombatPerk[] {
  const eyes = hasInsight(state, ctx)
    ? [
        'insight' as const,
        ...(ctx.content.clans.get(state.character.clanId)?.kekkeiGenkai?.perks ?? []),
      ]
    : [];
  return [...eyes, ...playerWalking(state, ctx)];
}

/** The tools in your pouch, as the fight sees them. */
function pouchOf(state: GameState, ctx: GameContext): CombatItem[] {
  return Object.entries(state.inventory.tools).flatMap(([id, count]) => {
    const def = ctx.content.tools.get(id);
    return def && count > 0 ? [{ id, name: def.name, effect: def.effect, count }] : [];
  });
}

/** Takes the tools a finished fight used up out of the pouch. */
export function afterPouch(state: GameState, outcome: CombatOutcome): GameState {
  if (!outcome.items) return state;
  return { ...state, inventory: restockPouch(state.inventory, outcome.items) };
}

/** The player's combatant id in every fight. */
export const PLAYER_COMBATANT_ID = 'player';

/** What the player knows, the unstable ones marked so the fight makes them costly and unsure. */
function playerTechniques(state: GameState, ctx: GameContext): CombatTechnique[] {
  const { known, unstable } = state.techniques;
  return known.map((id) => {
    const def = ctx.content.techniques.require(id);
    return unstable.includes(id) ? { ...def, unstable: true } : def;
  });
}

export function playerCombatant(state: GameState, ctx: GameContext): CombatantSetup {
  const { name, stats, vitals, nature } = state.character;
  const armed = combatStats(state, ctx);
  return {
    id: PLAYER_COMBATANT_ID,
    name,
    attributes: attributesOf(armed),
    health: vitals.health,
    maxHealth: MAX_HEALTH,
    chakra: vitals.chakra,
    maxChakra: maxChakra(stats),
    techniques: playerTechniques(state, ctx),
    nature,
    perks: perksOf(state, ctx),
    items: pouchOf(state, ctx),
    gear: combatGear(state, ctx),
    provisions: mealProvisions(state, ctx),
  };
}

/** Qualities of a meal good enough to bring its provision into a fight. */
const PROVISIONING: readonly MealQuality[] = ['good', 'fine'];

/** What today's meal brings into a fight, when it was cooked well. */
export function mealProvisions(state: GameState, ctx: GameContext): CombatProvision[] {
  const { meal, mealQuality } = state.character;
  const recipe = meal ? ctx.content.recipes.get(meal) : undefined;
  if (!recipe?.provision || !PROVISIONING.includes(mealQuality ?? 'good')) return [];
  return [recipe.provision];
}

/** A human's 100 health, scaled for creatures bigger or smaller than one. */
function enemyMaxHealth(def: Pick<EnemyDef, 'healthScale'>): number {
  return Math.max(1, Math.round(MAX_HEALTH * (def.healthScale ?? 1)));
}

/**
 * An enemy's stat line. Their chakra is authored (`EnemyDef.maxChakra`), so their reserves are
 * whatever gives that chakra at their control: a beast with none has none to speak of.
 */
export function enemyStatLine(def: EnemyDef): Stats {
  const stats = createStats(def.baseStat, def.statBonuses);
  return { ...stats, reserves: reservesFor(def.maxChakra, stats.chakraControl) };
}

/** The combatant id of the `index`th enemy of a fight. */
export function enemyCombatantId(enemyId: string, index: number): string {
  return `${enemyId}#${index}`;
}

export function enemyCombatant(def: EnemyDef, index: number, ctx: GameContext): CombatantSetup {
  const walking = enemyWalking(def);
  return {
    id: enemyCombatantId(def.id, index),
    name: def.name,
    tag: def.kind,
    attributes: attributesOf(enemyStatLine(def)),
    health: enemyMaxHealth(def),
    maxHealth: enemyMaxHealth(def),
    chakra: def.maxChakra,
    maxChakra: def.maxChakra,
    techniques: def.techniqueIds.map((id) => ctx.content.techniques.require(id)),
    ...(def.nature ? { nature: def.nature } : {}),
    ...(def.traits ? { traits: def.traits } : {}),
    ...(walking.length > 0 ? { perks: walking } : {}),
  };
}

/** The combatant id of the `k`th body in the retinue of the `index`th enemy of a fight. */
export function retinueCombatantId(unitId: string, index: number, k: number): string {
  return `${unitId}#${index}.${k}`;
}

/**
 * The `index`th enemy of a fight and the bodies fighting beside them (`EnemyDef.retinue`):
 * by default a companion is simply one more fighter on their side.
 */
export function enemyParty(def: EnemyDef, index: number, ctx: GameContext): CombatantSetup[] {
  const units = (def.retinue ?? []).map((entry, k) => ({
    ...enemyCombatant(ctx.content.enemies.require(entry.enemyId), index, ctx),
    id: retinueCombatantId(entry.enemyId, index, k),
  }));
  return [enemyCombatant(def, index, ctx), ...units];
}
