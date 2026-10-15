import { slotName } from '@/systems/time';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { festivalToday } from '../village';
import { activeScene } from '../views/peopleScenes';

/**
 * Which music is playing: the mood of where you are and what is happening. Scenes set their
 * own (a fight, the road, a ceremony); in the village it follows the clock and the calendar.
 * The game names the mood; the screen decides how a mood sounds.
 */

export const MUSIC_MOODS = [
  /** The title screen. */
  'title',
  'day',
  'night',
  'festival',
  /** On the road: a job's legs, a journey. */
  'road',
  /** Sizing foes up, an exam. */
  'tension',
  'fight',
  /** A promotion. */
  'ceremony',
  /** Talks and the quiet scenes of the genin years. */
  'calm',
] as const;
export type MusicMood = (typeof MUSIC_MOODS)[number];

export function musicMood(state: GameState, ctx: GameContext): MusicMood {
  switch (activeScene(state)) {
    case 'combat':
      return 'fight';
    case 'encounter':
    case 'exam':
      return 'tension';
    case 'mission':
      return 'road';
    case 'promotion':
      return 'ceremony';
    case 'conversation':
    case 'team':
    case 'chakra-paper':
    case 'sensei-test':
      return 'calm';
    case null:
      return villageMood(state, ctx);
  }
}

function villageMood(state: GameState, ctx: GameContext): MusicMood {
  const slot = slotName(state.time);
  if (slot === 'evening' || slot === 'night') return 'night';
  return festivalToday(state, ctx) ? 'festival' : 'day';
}
