import { buildContentDb, CONTENT_PACKS, type ContentDb, type ContentPack } from '@/content';
import { createDuelEngine, createPlanEngine, type CombatEngine } from '@/systems/combat';

/**
 * Dependencies the game logic needs but should not hard-code. This is the composition
 * root: to add or swap a combat engine or load a different content pack, change it here —
 * or pass a different context in tests.
 */
export interface GameContext {
  readonly content: ContentDb;
  /** Every fight style on offer; the first is the default. A save picks one in its settings. */
  readonly engines: readonly CombatEngine[];
  /**
   * Shelved styles: no longer offered or started, but a fight already under way in one (from a
   * save made before it was shelved) still plays out in it.
   */
  readonly shelvedEngines: readonly CombatEngine[];
}

/**
 * The fight styles this build offers, default first. Plan & Watch is the canonical engine.
 * Classic and Deck are shelved: their engines are kept and tested in `systems/combat`, but
 * not offered.
 */
export function defaultEngines(): readonly CombatEngine[] {
  return [createPlanEngine()];
}

/**
 * Shelved styles a save may still be mid-fight in. Classic was offered up to save version 13;
 * Deck fights were called off when it was shelved, so it needs no route.
 */
export function shelvedEngines(): readonly CombatEngine[] {
  return [createDuelEngine()];
}

export function createGameContext(
  pack: ContentPack,
  engines: readonly CombatEngine[] = defaultEngines(),
): GameContext {
  return { content: buildContentDb(pack), engines, shelvedEngines: shelvedEngines() };
}

export interface PackChoice {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

/** The content packs this build includes, default first. */
export function packChoices(): readonly PackChoice[] {
  return CONTENT_PACKS.map(({ id, name, description }) => ({ id, name, description }));
}

/** Context for a pack id, or null if this build doesn't include that pack. */
export function contextForPack(packId: string): GameContext | null {
  const pack = CONTENT_PACKS.find((p) => p.id === packId);
  return pack ? createGameContext(pack) : null;
}
