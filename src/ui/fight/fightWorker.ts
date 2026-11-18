import { dispatchAlone, type GameAction, type GameState } from '@/game';

/**
 * A Web Worker that plays a fight's step off the page's thread (`useOffThread`): foes who think
 * ahead search the real engine for their plans, which can take a second or more, and the page
 * should keep breathing meanwhile. The state and action come in, the result goes back.
 */

export interface FightJob {
  readonly state: GameState;
  readonly action: GameAction;
}

self.addEventListener('message', (event: MessageEvent<FightJob>) => {
  postMessage(dispatchAlone(event.data.state, event.data.action));
});
