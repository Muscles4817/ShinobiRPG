import { useCallback, useState } from 'react';

import {
  contextForPack,
  createNewGame,
  cueAfter,
  dispatch,
  serialize,
  soundAfter,
  type ActionCue,
  type CreationDraft,
  type GameAction,
  type SaveStore,
} from '@/game';

import { useSound } from './audio/SoundProvider';
import { useEdits } from './edits/EditsProvider';
import { fromOlderVersion, keepCopy, readSave, type Loaded } from './saveKeeping';
import { saveSafely, STORAGE_FULL } from './saveSafely';

/** An animation to play for the last action; `id` tells two of the same kind apart. */
export interface ShownCue {
  readonly kind: ActionCue;
  readonly id: number;
}

export interface GameSession {
  readonly game: Loaded | null;
  /** The most recent refusal or load problem, for a dismissible notice. */
  readonly notice: string | null;
  readonly perform: (action: GameAction) => void;
  /** The animation for the action just done, until it has played. */
  readonly cue: ShownCue | null;
  readonly clearCue: () => void;
  readonly start: (packId: string, draft: CreationDraft, seed: number) => void;
  readonly abandon: () => void;
  readonly dismissNotice: () => void;
  /** The save as text, to copy somewhere safe; null with no game. */
  readonly exportSave: () => string | null;
  /** Plays a save given as text, keeping a copy of the one it replaces. Null, or why not. */
  readonly importSave: (raw: string) => string | null;
  /** The copy kept of the last save replaced, updated or unreadable; null if there is none. */
  readonly keptCopy: () => string | null;
}

/** Where the device keeps nothing, for a session given no place for kept copies (tests). */
const NOWHERE: SaveStore = { load: () => null, save: () => undefined, clear: () => undefined };

function loadInitial(
  store: SaveStore,
  rescue: SaveStore,
): { game: Loaded | null; notice: string | null } {
  const raw = store.load();
  if (!raw) return { game: null, notice: null };
  const read = readSave(raw);
  if (!read.ok) {
    keepCopy(rescue, raw);
    return {
      game: null,
      notice: `Your save could not be loaded: ${read.error} A copy of it is kept on this device (Settings, Save data), and a new game won’t erase it.`,
    };
  }
  // The save as it was before this version changed it, in case the change went wrong.
  if (fromOlderVersion(raw)) keepCopy(rescue, raw);
  return { game: read.loaded, notice: null };
}

/** Owns the live GameState and its context: dispatches actions and autosaves after every change. */
export function useGameSession(store: SaveStore, rescue: SaveStore = NOWHERE): GameSession {
  const [initial] = useState(() => loadInitial(store, rescue));
  const [game, setGame] = useState<Loaded | null>(initial.game);
  const [notice, setNotice] = useState<string | null>(initial.notice);
  const [cue, setCue] = useState<ShownCue | null>(null);
  const { play } = useSound();
  const { editsFor } = useEdits();

  // Every change is saved as it is made; a save that doesn't fit says so rather than stopping play.
  const keep = useCallback(
    (next: Loaded) => {
      setGame(next);
      setNotice(saveSafely(store, serialize(next.game)) ? null : STORAGE_FULL);
    },
    [store],
  );

  const perform = useCallback(
    (action: GameAction) => {
      if (!game) return;
      const result = dispatch(game.game, action, game.ctx);
      if (result.ok) {
        keep({ ...game, game: result.value });
        const kind = cueAfter(action, game.game, result.value);
        setCue((shown) => (kind ? { kind, id: (shown?.id ?? 0) + 1 } : shown));
        const sound = soundAfter(action, game.game, result.value);
        if (sound) play(sound);
      } else {
        setNotice(result.error);
        play('refused');
      }
    },
    [game, keep, play],
  );

  // Whatever save is about to be replaced is kept as the device's copy first.
  const replace = useCallback(
    (next: Loaded) => {
      const old = store.load();
      if (old) keepCopy(rescue, old);
      keep(next);
    },
    [keep, rescue, store],
  );

  // A new game takes the editor's changes as they stand, and keeps them in its save.
  const start = useCallback(
    (packId: string, draft: CreationDraft, seed: number) => {
      const ctx = contextForPack(packId, editsFor(packId));
      if (!ctx) return;
      replace({ game: createNewGame({ draft, seed }, ctx), ctx });
    },
    [editsFor, replace],
  );

  const exportSave = useCallback(() => (game ? serialize(game.game) : null), [game]);

  const importSave = useCallback(
    (raw: string) => {
      const read = readSave(raw.trim());
      if (!read.ok) return `That save can’t be loaded: ${read.error}`;
      replace(read.loaded);
      return null;
    },
    [replace],
  );

  const keptCopy = useCallback(() => rescue.load(), [rescue]);

  const abandon = useCallback(() => {
    store.clear();
    setGame(null);
  }, [store]);

  const dismissNotice = useCallback(() => {
    setNotice(null);
  }, []);

  const clearCue = useCallback(() => {
    setCue(null);
  }, []);

  return {
    game,
    notice,
    perform,
    cue,
    clearCue,
    start,
    abandon,
    dismissNotice,
    exportSave,
    importSave,
    keptCopy,
  };
}
