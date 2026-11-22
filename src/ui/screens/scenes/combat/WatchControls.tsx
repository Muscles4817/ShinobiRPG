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

/**
 * What comes next once the beats have played: leaving a finished fight, the card table, the
 * next exchange, or flight.
 */
export function NextSteps({ view, waiting, onPick, onPlan, onLeave }: WatchNextProps) {
  const only = onLeave ?? onPlan;
  if (only) {
    return (
      <nav className="choices watch-next" aria-label="What next">
        <button type="button" className="choice primary" disabled={waiting} onClick={only}>
          {onLeave ? 'Continue' : view.called ? 'Change your plan' : 'Plan the next round'}
        </button>
      </nav>
    );
  }
  const steps = view.options.filter((o) => o.kind === 'continue' || o.kind === 'escape');
  return (
    <nav className="choices watch-next" aria-label="What next">
      {steps.map((o) => (
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
