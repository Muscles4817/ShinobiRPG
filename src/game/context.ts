import { buildContentDb, CONTENT_PACKS, type ContentDb, type ContentPack } from '@/content';
import { createDuelEngine, type CombatEngine } from '@/systems/combat';

/**
 * Dependencies the game logic needs but should not hard-code. This is the composition
 * root: to swap the combat engine or load a different content pack, change it here —
 * or pass a different context in tests.
 */
export interface GameContext {
  readonly content: ContentDb;
  readonly combat: CombatEngine;
}

export function createGameContext(pack: ContentPack): GameContext {
  return { content: buildContentDb(pack), combat: createDuelEngine() };
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
