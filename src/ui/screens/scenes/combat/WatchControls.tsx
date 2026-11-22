import type { CombatOption, CombatView } from '@/game';

import type { usePlayback } from './usePlayback';

/** The watch screen's controls: playing the beats, and what comes once they have played. */

export interface WatchNextProps {
  readonly view: CombatView;
  /** A step you asked for is still being played: no way on until its lines arrive. */
  readonly waiting: boolean;
  readonly onPick: (option: CombatOption) => void;
  /** Between rounds: back to the card table; null mid-round. */
  readonly onPlan: (() => void) | null;
  /** The fight is over: leave the scene. */
  readonly onLeave: (() => void) | null;
}

/** What may come next once the beats have played: one way on, or the fight's steps. */
type WatchNext =
  | { readonly kind: 'only'; readonly label: string; readonly go: () => void }
  | { readonly kind: 'steps'; readonly steps: readonly CombatOption[] };

/**
 * Leaving a finished fight, or the card table between rounds, is the one way on; mid-round it
 * is the next exchange, the round, or flight. The buttons and Enter both read it here.
 */
export function watchNext({ view, onPlan, onLeave }: WatchNextProps): WatchNext {
  if (onLeave) return { kind: 'only', label: 'Continue', go: onLeave };
  if (onPlan) {
    const label = view.called ? 'Change your plan' : 'Plan the next round';
    return { kind: 'only', label, go: onPlan };
  }
  const steps = view.options.filter((o) => o.kind === 'continue' || o.kind === 'escape');
  return { kind: 'steps', steps };
}

/** What Enter does once the beats have played: the one way on, or the first step open. */
export function enterGoesOn(props: WatchNextProps): (() => void) | undefined {
  if (props.waiting) return undefined;
  const next = watchNext(props);
  if (next.kind === 'only') return next.go;
  const step = next.steps.find((o) => o.kind === 'continue' && !o.disabledReason);
  return step
    ? () => {
        props.onPick(step);
      }
    : undefined;
}

/** What comes next once the beats have played, as buttons. */
export function NextSteps(props: WatchNextProps) {
  const { waiting, onPick } = props;
  const next = watchNext(props);
  if (next.kind === 'only') {
    return (
      <nav className="choices watch-next" aria-label="What next">
        <button type="button" className="choice primary" disabled={waiting} onClick={next.go}>
          {next.label}
        </button>
      </nav>
    );
  }
  return (
    <nav className="choices watch-next" aria-label="What next">
      {next.steps.map((o) => (
        <button
          key={o.id}
          type="button"
          className={o.kind === 'escape' ? 'choice' : 'choice primary'}
          disabled={waiting || o.disabledReason !== undefined}
          onClick={() => {
            onPick(o);
          }}
        >
          {o.label}
          {o.disabledReason && <small>{o.disabledReason}</small>}
        </button>
      ))}
    </nav>
  );
}

type Playback = ReturnType<typeof usePlayback>;

/** Back, play or pause, on, speed and skip; and whether it stops when something comes at you. */
export function PlaybackBar({
  play,
  watched,
}: {
  readonly play: Playback;
  readonly watched: boolean;
}) {
  return (
    <div className="playback">
      {!play.done && (
        <div className="playback-buttons" role="group" aria-label="Playback">
          <button
            type="button"
            className="btn ghost small"
            aria-label="Back a beat"
            onClick={() => {
              play.step(-1);
            }}
          >
            ‹
          </button>
          <button type="button" className="btn small" onClick={play.toggle}>
            {play.playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            className="btn ghost small"
            aria-label="On a beat"
            onClick={() => {
              play.step(1);
            }}
          >
            ›
          </button>
          <button type="button" className="btn ghost small" onClick={play.faster}>
            {play.speed === 1 ? 'Normal speed' : 'Double speed'}
          </button>
          <button type="button" className="btn ghost small" onClick={play.skip}>
            Skip
          </button>
        </div>
      )}
      {!watched && (
        <button
          type="button"
          className="stop-toggle"
          aria-pressed={play.stopForYou}
          onClick={play.toggleStopForYou}
        >
          {play.stopForYou ? 'Stops when something comes at you' : 'Plays straight through'}
        </button>
      )}
    </div>
  );
}
