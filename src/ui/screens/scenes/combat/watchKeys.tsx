import type { CombatOption, CombatView } from '@/game';

import { useKeys } from '../../../layout/useKeys';
import { useWideScreen } from '../../../layout/useWideScreen';

import type { usePlayback } from './usePlayback';

type Playback = ReturnType<typeof usePlayback>;

/** What the watch screen offers once the beats have played. */
interface WatchNext {
  readonly view: CombatView;
  readonly onPick: (option: CombatOption) => void;
  readonly onPlan: (() => void) | null;
  readonly onLeave: (() => void) | null;
}

/** What Enter does once the beats have played: the one way on, or the first step offered. */
function nextStep(props: WatchNext): (() => void) | undefined {
  const only = props.onLeave ?? props.onPlan;
  if (only) return only;
  const step = props.view.options.find((o) => o.kind === 'continue' && !o.disabledReason);
  return step
    ? () => {
        props.onPick(step);
      }
    : undefined;
}

/**
 * On the desktop layout: Space plays or pauses, the arrows step a beat back or on, S skips to
 * the end, and once it has played Enter goes on.
 */
export function useWatchKeys(play: Playback, props: WatchNext): void {
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
  useKeys(play.done ? { Enter: nextStep(props) } : playing, wide);
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
