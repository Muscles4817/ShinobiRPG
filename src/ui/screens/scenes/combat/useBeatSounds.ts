import { useEffect } from 'react';

import { beatSound, type FightBeat } from '@/game';

import { useSound } from '../../../audio/SoundProvider';

/**
 * Each beat of a fresh fight sounds as it is shown: the clappers between exchanges, the blows,
 * each as big as the turn behind it.
 */
export function useBeatSounds(beat: FightBeat | undefined, youId: string | null, fresh: boolean) {
  const { play } = useSound();
  useEffect(() => {
    if (!fresh || !beat) return;
    const cue = beatSound(beat, youId);
    if (cue) play(cue.sound, cue.force);
  }, [beat, fresh, play, youId]);
}
