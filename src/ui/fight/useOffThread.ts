import { useCallback, useEffect, useRef } from 'react';

import { dispatchAlone, type GameAction, type GameState } from '@/game';

import type { FightJob } from './fightWorker';

/**
 * Playing a step off the page's thread (`fightWorker.ts`). Play is deterministic, so the worker
 * gives exactly what `dispatch` would; where there are no workers (tests, an old browser) the
 * step is played here instead. One step at a time: the caller waits for each before the next.
 */

type Played = ReturnType<typeof dispatchAlone>;

function canUseWorkers(): boolean {
  return typeof Worker !== 'undefined';
}

export function useOffThread(): (state: GameState, action: GameAction) => Promise<Played> {
  const worker = useRef<Worker | null>(null);
  useEffect(
    () => () => {
      worker.current?.terminate();
      worker.current = null;
    },
    [],
  );
  return useCallback((state: GameState, action: GameAction) => {
    if (!canUseWorkers()) return Promise.resolve(dispatchAlone(state, action));
    worker.current ??= new Worker(new URL('./fightWorker.ts', import.meta.url), { type: 'module' });
    const running = worker.current;
    return new Promise<Played>((resolve) => {
      running.onmessage = (event: MessageEvent<Played>) => {
        resolve(event.data);
      };
      // A worker that fails plays the step here instead, so a bout never stalls.
      running.onerror = () => {
        resolve(dispatchAlone(state, action));
      };
      const job: FightJob = { state, action };
      running.postMessage(job);
    });
  }, []);
}
