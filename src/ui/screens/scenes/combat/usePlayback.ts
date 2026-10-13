import { useEffect, useState } from 'react';

import type { FightBeat } from '@/game';

/**
 * Plays a fight's beats one at a time on the watch screen: on its own at the chosen speed,
 * stopping by itself when a beat comes at you (if you want it to), and saying when the last
 * beat has played so the screen can move on.
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

export function usePlayback({ beats, youId, fresh, onDone }: PlaybackOptions) {
  const last = Math.max(0, beats.length - 1);
  const [at, setAt] = useState(fresh ? 0 : last);
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
      setAt(at + 1);
      if (atYou) {
        setPlaying(false);
        setStoppedForYou(true);
      }
    }, wait);
    return () => {
      clearTimeout(timer);
    };
  }, [at, beats, done, onDone, playing, speed, stopForYou, youId]);

  return {
    at,
    beat: beats[at],
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
      setAt((i) => Math.min(last, Math.max(0, i + by)));
      setStoppedForYou(false);
    },
    skip: () => {
      setAt(last);
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
