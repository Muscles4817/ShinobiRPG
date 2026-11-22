import { useKeys } from '../../../layout/useKeys';
import { useWideScreen } from '../../../layout/useWideScreen';

import type { usePlayback } from './usePlayback';
import { enterGoesOn, type WatchNextProps } from './WatchControls';

type Playback = ReturnType<typeof usePlayback>;

/**
 * On the desktop layout: Space plays or pauses, the arrows step a beat back or on, S skips to
 * the end, and once it has played Enter goes on.
 */
export function useWatchKeys(play: Playback, props: WatchNextProps): void {
  const wide = useWideScreen();
  const playing = {
    ' ': play.toggle,
    ArrowLeft: () => {
      play.step(-1);
    },
    ArrowRight: () => {
      play.step(1);
    },
    s: play.skip,
    S: play.skip,
  };
  useKeys(play.done ? { Enter: enterGoesOn(props) } : playing, wide);
}

/** The keys, said once under the playback on the desktop layout. */
export function KeyNote() {
  const wide = useWideScreen();
  if (!wide) return null;
  return (
    <p className="key-note">
      Space plays or pauses, the arrows step a beat, S skips, and Enter goes on.
    </p>
  );
}
