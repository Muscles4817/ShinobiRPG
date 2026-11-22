import { useEffect, useState } from 'react';

import type { FightBeat } from '@/game';

/**
 * Plays a fight's beats one at a time on the watch screen: on its own at the chosen speed,
 * stopping by itself when a beat comes at you (if you want it to), and saying when the last
 * beat has played so the screen can move on. It also says how the beat shown was reached: a
 * beat arrived at by playing on (or stepping on) one beat is an `arrival`, which its sound and
 * its bars' flashes answer; stepping back or skipping to the end arrives nowhere.
 */

/** How long a line stays up at normal speed; dividers pass in half the time. */
const BEAT_MS = 1700;

export type Speed = 1 | 2;

interface PlaybackOptions {
  readonly beats: readonly FightBeat[];
  /** Your combatant id, for stopping when a beat comes at you. */
  readonly youId: string | null;
  /** Start playing at once (new beats) or show the last beat (nothing new). */
  readonly fresh: boolean;
  readonly onDone: () => void;
}

/** Where the playback stands, and how it got there. */
interface Position {
  readonly at: number;
  /** Counts the beats arrived at by going on one, so each arrival is told apart. */
  readonly arrivals: number;
  /** The beat shown was arrived at by going on one (or is the first of fresh beats). */
  readonly arrived: boolean;
}

/** One beat on, as an arrival; or nowhere past the last. */
function onOne(p: Position, last: number): Position {
  return p.at >= last ? p : { at: p.at + 1, arrivals: p.arrivals + 1, arrived: true };
}

export function usePlayback({ beats, youId, fresh, onDone }: PlaybackOptions) {
  const last = Math.max(0, beats.length - 1);
  const [position, setPosition] = useState<Position>({
    at: fresh ? 0 : last,
    arrivals: fresh ? 1 : 0,
    arrived: fresh,
  });
  const at = position.at;
  const [playing, setPlaying] = useState(fresh && beats.length > 1);
  const [speed, setSpeed] = useState<Speed>(1);
  const [stopForYou, setStopForYou] = useState(true);
  const [stoppedForYou, setStoppedForYou] = useState(false);
  const done = at >= last;

  useEffect(() => {
    if (done) {
      onDone();
      return;
    }
    if (!playing) return;
    const beat = beats[at];
    const wait = (beat?.kind === 'divider' ? BEAT_MS / 2 : BEAT_MS) / speed;
    const timer = setTimeout(() => {
      const next = beats[at + 1];
      const atYou = stopForYou && youId !== null && next?.targetId === youId;
      setPosition((p) => onOne(p, last));
      if (atYou) {
        setPlaying(false);
        setStoppedForYou(true);
      }
    }, wait);
    return () => {
      clearTimeout(timer);
    };
  }, [at, beats, done, last, onDone, playing, speed, stopForYou, youId]);

  return {
    at,
    beat: beats[at],
    /** Which arrival brought the beat shown, or null when it was reached going back or skipping. */
    arrival: position.arrived ? position.arrivals : null,
    done,
    playing: playing && !done,
    speed,
    stopForYou,
    stoppedForYou,
    toggle: () => {
      setPlaying((p) => !p);
      setStoppedForYou(false);
    },
    step: (by: 1 | -1) => {
      setPosition((p) =>
        by === 1 ? onOne(p, last) : { ...p, at: Math.max(0, p.at - 1), arrived: false },
      );
      setStoppedForYou(false);
    },
    skip: () => {
      setPosition((p) => ({ ...p, at: last, arrived: false }));
      setPlaying(false);
      setStoppedForYou(false);
    },
    faster: () => {
      setSpeed((s) => (s === 1 ? 2 : 1));
    },
    toggleStopForYou: () => {
      setStopForYou((s) => !s);
    },
  };
}
