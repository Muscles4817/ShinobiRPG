import { buildContentDb, DEFAULT_CONTENT_SOURCE, type ContentDb } from '@/content';
import { createDuelEngine, type CombatEngine } from '@/systems/combat';

/**
 * Dependencies the game logic needs but should not hard-code. This is the composition
 * root: to swap the combat engine (or load different content), change it here — or pass
 * a different context in tests.
 */
export interface GameContext {
  readonly content: ContentDb;
  readonly combat: CombatEngine;
}

export function createDefaultContext(): GameContext {
  return {
    content: buildContentDb(DEFAULT_CONTENT_SOURCE),
    combat: createDuelEngine(),
  };
}
