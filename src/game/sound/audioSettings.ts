/**
 * How loud the game is. These belong to the device, not to a save: they hold on the title
 * screen, in versus bouts and across new games, so they are stored apart from the save (a
 * `SaveStore` of their own) and read back defensively.
 */

/** Volumes are whole steps of ten, from 0 (silent) to 100. */
export const VOLUME_STEP = 10;
export const MAX_VOLUME = 100;

export interface AudioSettings {
  /** The master switch: off silences everything without losing the volumes. */
  readonly sound: boolean;
  /** Taps, everyday moments and a fight's blows. */
  readonly effectsVolume: number;
  readonly musicVolume: number;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  sound: true,
  effectsVolume: 70,
  musicVolume: 40,
};

/** A volume rounded to a step and kept in range. */
export function clampVolume(volume: number): number {
  if (!Number.isFinite(volume)) return 0;
  const stepped = Math.round(volume / VOLUME_STEP) * VOLUME_STEP;
  return Math.min(MAX_VOLUME, Math.max(0, stepped));
}

function volumeOr(value: unknown, fallback: number): number {
  return typeof value === 'number' ? clampVolume(value) : fallback;
}

/** Stored settings back, with defaults for anything missing or damaged. */
export function readAudioSettings(raw: string | null): AudioSettings {
  if (raw === null) return DEFAULT_AUDIO_SETTINGS;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
  if (typeof parsed !== 'object' || parsed === null) return DEFAULT_AUDIO_SETTINGS;
  // Trust boundary: stored text, checked field by field below.
  const stored = parsed as Partial<Record<keyof AudioSettings, unknown>>;
  const d = DEFAULT_AUDIO_SETTINGS;
  return {
    sound: typeof stored.sound === 'boolean' ? stored.sound : d.sound,
    effectsVolume: volumeOr(stored.effectsVolume, d.effectsVolume),
    musicVolume: volumeOr(stored.musicVolume, d.musicVolume),
  };
}

export function writeAudioSettings(settings: AudioSettings): string {
  return JSON.stringify(settings);
}
