import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  readAudioSettings,
  writeAudioSettings,
  type AudioSettings,
  type MusicMood,
  type SaveStore,
  type Sound,
  type SoundForce,
} from '@/game';

import { saveSafely } from '../saveSafely';
import { createAudioEngine, type AudioEngine } from './engine';

/**
 * Sound for the whole app: the volumes (kept on the device, apart from the save), the engine
 * that plays them, a soft tap for every button pressed, and the music of the moment. Audio
 * starts with the first tap, as browsers require, and holds while the app is out of sight.
 */

export interface SoundApi {
  readonly settings: AudioSettings;
  readonly change: (next: AudioSettings) => void;
  readonly play: (sound: Sound, force?: SoundForce) => void;
  readonly setMood: (mood: MusicMood | null) => void;
}

const SILENT: SoundApi = {
  settings: readAudioSettings(null),
  change: () => undefined,
  play: () => undefined,
  setMood: () => undefined,
};

const SoundContext = createContext<SoundApi>(SILENT);

/** What a press lands on that should tap: an enabled button, a link, a range's thumb. */
const TAPPABLE = 'button:not(:disabled), a[href], [role="button"]';
const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'click'] as const;

function useDocumentListeners(engine: AudioEngine): void {
  useEffect(() => {
    const unlock = () => {
      engine.unlock();
    };
    const tap = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(TAPPABLE)) engine.play('tap');
    };
    const visibility = () => {
      engine.pause(document.hidden);
    };
    for (const name of UNLOCK_EVENTS) document.addEventListener(name, unlock, true);
    document.addEventListener('click', tap);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      for (const name of UNLOCK_EVENTS) document.removeEventListener(name, unlock, true);
      document.removeEventListener('click', tap);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [engine]);
}

export function SoundProvider({
  prefs,
  children,
}: {
  readonly prefs: SaveStore;
  readonly children: ReactNode;
}) {
  const [settings, setSettings] = useState(() => readAudioSettings(prefs.load()));
  const [engine] = useState(() => createAudioEngine(settings));
  useDocumentListeners(engine);

  const api = useMemo<SoundApi>(
    () => ({
      settings,
      change: (next) => {
        setSettings(next);
        engine.setLevels(next);
        saveSafely(prefs, writeAudioSettings(next));
      },
      play: engine.play,
      setMood: engine.setMood,
    }),
    [engine, prefs, settings],
  );
  return <SoundContext value={api}>{children}</SoundContext>;
}

export function useSound(): SoundApi {
  return useContext(SoundContext);
}

/** Keeps `mood`'s music playing while the calling screen is up. */
export function useMusic(mood: MusicMood | null): void {
  const { setMood } = useSound();
  useEffect(() => {
    setMood(mood);
  }, [mood, setMood]);
}
