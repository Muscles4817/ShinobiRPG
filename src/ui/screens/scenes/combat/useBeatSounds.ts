import { useEffect } from 'react';

import { beatSound, type FightBeat } from '@/game';

import { useSound } from '../../../audio/SoundProvider';

/** Each beat of a fresh fight sounds as it is shown: the clappers between exchanges, the blows. */
export function useBeatSounds(beat: FightBeat | undefined, youId: string | null, fresh: boolean) {
  const { play } = useSound();
  useEffect(() => {
    if (!fresh || !beat) return;
    const sound = beatSound(beat, youId);
    if (sound) play(sound);
  }, [beat, fresh, play, youId]);
}
