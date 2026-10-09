import { useCallback, useEffect, useState } from 'react';

import {
  contextForPack,
  createNewGame,
  deserialize,
  dispatch,
  serialize,
  type CreationDraft,
  type GameAction,
  type GameContext,
  type GameState,
  type SaveStore,
} from '@/game';

interface Loaded {
  readonly game: GameState;
  readonly ctx: GameContext;
}

export interface GameSession {
  readonly game: Loaded | null;
  /** The most recent refusal or load problem, for a dismissible notice. */
  readonly notice: string | null;
  readonly perform: (action: GameAction) => void;
  readonly start: (packId: string, draft: CreationDraft, seed: number) => void;
  readonly abandon: () => void;
  readonly dismissNotice: () => void;
}

function loadInitial(store: SaveStore): { game: Loaded | null; notice: string | null } {
  const raw = store.load();
  if (!raw) return { game: null, notice: null };
  const loaded = deserialize(raw);
  if (!loaded.ok) return { game: null, notice: `Your save could not be loaded: ${loaded.error}` };
  const ctx = contextForPack(loaded.value.packId);
  if (!ctx) {
    return {
      game: null,
      notice: `Your save uses the "${loaded.value.packId}" world, which this version doesn’t include.`,
    };
  }
  return { game: { game: loaded.value, ctx }, notice: null };
}

/** Owns the live GameState and its context: dispatches actions and autosaves after every change. */
export function useGameSession(store: SaveStore): GameSession {
  const [initial] = useState(() => loadInitial(store));
  const [game, setGame] = useState<Loaded | null>(initial.game);
  const [notice, setNotice] = useState<string | null>(initial.notice);

  useEffect(() => {
    if (game) store.save(serialize(game.game));
  }, [game, store]);

  const perform = useCallback(
    (action: GameAction) => {
      if (!game) return;
      const result = dispatch(game.game, action, game.ctx);
      if (result.ok) {
        setGame({ ...game, game: result.value });
        setNotice(null);
      } else {
        setNotice(result.error);
      }
    },
    [game],
  );

  const start = useCallback((packId: string, draft: CreationDraft, seed: number) => {
    const ctx = contextForPack(packId);
    if (!ctx) return;
    setGame({ game: createNewGame({ draft, seed }, ctx), ctx });
    setNotice(null);
  }, []);

  const abandon = useCallback(() => {
    store.clear();
    setGame(null);
  }, [store]);

  const dismissNotice = useCallback(() => {
    setNotice(null);
  }, []);

  return { game, notice, perform, start, abandon, dismissNotice };
}
