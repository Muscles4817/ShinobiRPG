import type { GameContext, GameState } from '@/game';

import type { GameSession } from '../useGameSession';

/** Props shared by every in-game panel and tab. */
export interface TabProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly session: GameSession;
}
