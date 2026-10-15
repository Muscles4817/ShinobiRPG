import type { CombatantView, CombatOption, CombatView, FightBeat, ScoutingRead } from '@/game';

import { Chips } from '../../../components/Chips';
import { Formation, shortName } from './Formation';
import { useBeatSounds } from './useBeatSounds';
import { usePlayback } from './usePlayback';
import { useHealthPulses } from './useHealthPulses';

type OnPick = (option: CombatOption) => void;

interface WatchScreenProps {
  readonly view: CombatView;
  readonly beats: readonly FightBeat[];
  /** These beats haven't been watched yet: play them. */
  readonly fresh: boolean;
  readonly reads: Readonly<Record<string, ScoutingRead>>;
  readonly onPick: OnPick;
  /** The last beat has played (or been skipped to). */
  readonly onWatched: () => void;
  /** Between rounds: back to the card table once you have watched; null mid-round. */
  readonly onPlan: (() => void) | null;
  /** The fight is over: leave the scene (to its result) once you have watched it end. */
  readonly onLeave: (() => void) | null;
}

const EARLIER_SHOWN = 2;
const NO_SELECTION = () => undefined;

/** The beats of the exchange that beat `at` belongs to. */
function exchangeAround(beats: readonly FightBeat[], at: number): readonly FightBeat[] {
  const start = beats.slice(0, at + 1).findLastIndex((b) => b.kind === 'divider');
  const end = beats.findIndex((b, i) => i > at && b.kind === 'divider');
  return beats.slice(start + 1, end < 0 ? undefined : end);
}

/** Who has acted in this exchange so far, in order, faded once done; the one acting is ringed. */
function ActingOrder({
  beats,
  at,
  fighters,
}: {
  readonly beats: readonly FightBeat[];
  readonly at: number;
  readonly fighters: readonly CombatantView[];
}) {
  const exchange = exchangeAround(beats, at);
  const actors = [...new Set(exchange.flatMap((b) => (b.actorId ? [b.actorId] : [])))];
  if (actors.length === 0) return null;
  const now = beats[at]?.actorId;
  const firstBeat = (id: string) => {
    const first = exchange.find((b) => b.actorId === id);
    return first ? beats.indexOf(first) : -1;
  };
  return (
    <p className="acting-order">
      <span>Acting order</span>
      {actors.map((id) => {
        const f = fighters.find((c) => c.id === id);
        const state = id === now ? 'now' : firstBeat(id) < at ? 'done' : 'waiting';
        return (
          <span key={id} className={`token-seal small ${f?.side ?? ''} ${state}`} title={f?.name}>
            {shortName(f?.name ?? '?').mark}
          </span>
        );
      })}
    </p>
  );
}

/**
 * What comes next once the beats have played: leaving a finished fight, the card table, the
 * next exchange, or flight.
 */
function NextSteps({
  view,
  onPick,
  onPlan,
  onLeave,
}: Pick<WatchScreenProps, 'view' | 'onPick' | 'onPlan' | 'onLeave'>) {
  const only = onLeave ?? onPlan;
  if (only) {
    return (
      <nav className="choices watch-next" aria-label="What next">
        <button type="button" className="choice primary" onClick={only}>
          {onLeave ? 'Continue' : 'Plan the next round'}
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
          disabled={o.disabledReason !== undefined}
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
function PlaybackBar({ play }: { readonly play: Playback }) {
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
      <button
        type="button"
        className="stop-toggle"
        aria-pressed={play.stopForYou}
        onClick={play.toggleStopForYou}
      >
        {play.stopForYou ? 'Stops when something comes at you' : 'Plays straight through'}
      </button>
    </div>
  );
}

/** The beat being told, with the two before it fading above. */
function BeatText({ beats, at }: { readonly beats: readonly FightBeat[]; readonly at: number }) {
  const beat = beats[at];
  const earlier = beats
    .slice(0, at)
    .filter((b) => b.kind === 'line')
    .slice(-EARLIER_SHOWN);
  return (
    <section className="beat-text" aria-live="polite">
      {earlier.map((b, i) => (
        <p key={`${at}-${i}`} className="earlier story">
          {b.text}
        </p>
      ))}
      {beat && (
        <p key={at} className={beat.kind === 'divider' ? 'divider' : 'story now'}>
          {beat.text} <Chips chips={beat.chips} />
        </p>
      )}
    </section>
  );
}

/**
 * The fight as it plays: both sides on the stage, one beat at a time. Whoever acts is lit,
 * whoever they act on is marked, health moves as it happens, and the line is told below. It
 * plays on its own (faster if you like), stops when something comes at you, and once it has
 * played offers what comes next.
 */
export function WatchScreen(props: WatchScreenProps) {
  const { view, beats, fresh, reads, onWatched } = props;
  const you = view.combatants.find((c) => c.side === 'player');
  const play = usePlayback({ beats, youId: you?.id ?? null, fresh, onDone: onWatched });
  const beat = play.beat;
  useBeatSounds(beat, you?.id ?? null, fresh);
  const fighters = view.combatants.map((c) => ({ ...c, health: beat?.health[c.id] ?? c.health }));
  const pulses = useHealthPulses(fighters);
  // The heading names the stretch you are in; a divider being told now is the beat itself.
  const heading = beats.slice(0, play.at).findLast((b) => b.kind === 'divider')?.text;
  return (
    <>
      <header className="scene-head watch-head">
        <h1>{heading ?? 'The fight'}</h1>
      </header>
      <main className="page watch-screen">
        <ActingOrder beats={beats} at={play.at} fighters={view.combatants} />
        <Formation
          fighters={fighters}
          range={beat?.range ?? view.range}
          reads={reads}
          pulses={pulses}
          selected={null}
          onSelect={NO_SELECTION}
          stage={{ actorId: beat?.actorId ?? null, targetId: beat?.targetId ?? null }}
        />
        <BeatText beats={beats} at={play.at} />
        {play.stoppedForYou && (
          <p className="stopped-for-you">That one was aimed at you. Press play to carry on.</p>
        )}
        <PlaybackBar play={play} />
      </main>
      {play.done && (
        <NextSteps
          view={view}
          onPick={props.onPick}
          onPlan={props.onPlan}
          onLeave={props.onLeave}
        />
      )}
    </>
  );
}
