import { useEffect, useRef } from 'react';

import { beatSound, type FightBeat } from '@/game';

import { useSound } from '../../../audio/SoundProvider';

/**
 * Each beat of a fresh fight sounds as it arrives (`usePlayback`'s `arrival`): the clappers
 * between exchanges, the blows, each as big as the turn behind it. A beat reached going back,
 * or skipped to, is silent, and an arrival sounds once however often the screen is drawn.
 */
export function useBeatSounds(
  beat: FightBeat | undefined,
  youId: string | null,
  arrival: number | null,
) {
  const { play } = useSound();
  const sounded = useRef<number | null>(null);
  useEffect(() => {
    if (arrival === null || !beat || sounded.current === arrival) return;
    sounded.current = arrival;
    const cue = beatSound(beat, youId);
    if (cue) play(cue.sound, cue.force);
  }, [arrival, beat, play, youId]);
}
