import { useCallback, useEffect, useState } from 'react';

import {
  createNewGame,
  deserialize,
  dispatch,
  serialize,
  type GameAction,
  type GameContext,
  type GameState,
  type SaveStore,
} from '@/game';

export interface GameSession {
  readonly state: GameState | null;
  /** The most recent refusal or load problem, for a dismissible notice. */
  readonly notice: string | null;
  readonly perform: (action: GameAction) => void;
  readonly start: (name: string, aptitudeId: string) => void;
  readonly abandon: () => void;
  readonly dismissNotice: () => void;
}

function loadInitial(store: SaveStore): { state: GameState | null; notice: string | null } {
  const raw = store.load();
  if (!raw) return { state: null, notice: null };
  const loaded = deserialize(raw);
  return loaded.ok
    ? { state: loaded.value, notice: null }
    : { state: null, notice: `Your save could not be loaded: ${loaded.error}` };
}

function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

/** Owns the live GameState: dispatches actions and autosaves after every change. */
export function useGameSession(ctx: GameContext, store: SaveStore): GameSession {
  const [initial] = useState(() => loadInitial(store));
  const [state, setState] = useState<GameState | null>(initial.state);
  const [notice, setNotice] = useState<string | null>(initial.notice);

  useEffect(() => {
    if (state) store.save(serialize(state));
  }, [state, store]);

  const perform = useCallback(
    (action: GameAction) => {
      if (!state) return;
      const result = dispatch(state, action, ctx);
      if (result.ok) {
        setState(result.value);
        setNotice(null);
      } else {
        setNotice(result.error);
      }
    },
    [state, ctx],
  );

  const start = useCallback(
    (name: string, aptitudeId: string) => {
      setState(createNewGame({ name, aptitudeId, seed: randomSeed() }, ctx));
      setNotice(null);
    },
    [ctx],
  );

  const abandon = useCallback(() => {
    store.clear();
    setState(null);
  }, [store]);

  const dismissNotice = useCallback(() => {
    setNotice(null);
  }, []);

  return { state, notice, perform, start, abandon, dismissNotice };
}
