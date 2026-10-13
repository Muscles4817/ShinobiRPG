import { useEffect } from 'react';

import { CueArt } from '../art/Cues';
import type { ShownCue } from '../useGameSession';

/** Longer than the longest cue's animation, so a cue that never reports its end still clears. */
const CUE_TIMEOUT_MS = 2500;

/**
 * Plays the animation for the action just done, above the dock where the thumb is. It never
 * takes a tap (the screen underneath is already up to date) and hides itself under reduced
 * motion.
 */
export function CueLayer({ cue, onDone }: { readonly cue: ShownCue; readonly onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, CUE_TIMEOUT_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [cue, onDone]);
  return (
    <>
      {cue.kind === 'sleep' && <div key={`night-${cue.id}`} className="cue-night" aria-hidden />}
      <div
        key={cue.id}
        className="cue-layer"
        data-cue={cue.kind}
        aria-hidden
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) onDone();
        }}
      >
        <CueArt kind={cue.kind} />
      </div>
    </>
  );
}
