import { useCallback, useState } from 'react';

import type { dispatchAlone, GameAction, GameState } from '@/game';

import { useOffThread } from './useOffThread';

/**
 * A fight's steps, played off the page's thread: foes think ahead before each round
 * (`engines/plan/mind/planner/`), which takes long enough on a phone to freeze the screen if it
 * were done here. While a step is out, `thinking` is set, and the caller takes no other action.
 * Anything that isn't a fight's step is the caller's to play as before.
 */

type Played = ReturnType<typeof dispatchAlone>;

export function isFightStep(action: GameAction): boolean {
  return action.type === 'combatAct';
}

export function useThinking(): {
  readonly thinking: boolean;
  readonly step: (state: GameState, action: GameAction, settle: (played: Played) => void) => void;
} {
  const offThread = useOffThread();
  const [thinking, setThinking] = useState(false);
  const step = useCallback(
    (state: GameState, action: GameAction, settle: (played: Played) => void) => {
      setThinking(true);
      void offThread(state, action).then((played) => {
        setThinking(false);
        settle(played);
      });
    },
    [offThread],
  );
  return { thinking, step };
}
