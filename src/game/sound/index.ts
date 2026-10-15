/** What the game sounds like: the sound of each moment, the music's mood, and the volumes. */
export { SOUNDS, beatSound, reportSound, soundAfter, type Sound } from './sounds';
export { MUSIC_MOODS, musicMood, type MusicMood } from './music';
export {
  DEFAULT_AUDIO_SETTINGS,
  MAX_VOLUME,
  VOLUME_STEP,
  clampVolume,
  readAudioSettings,
  writeAudioSettings,
  type AudioSettings,
} from './audioSettings';
