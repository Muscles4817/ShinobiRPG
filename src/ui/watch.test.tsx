// @vitest-environment jsdom
import { act as settle, renderHook } from '@testing-library/react';

import type { FightBeat } from '@/game';

import { usePlayback } from './screens/scenes/combat/usePlayback';

/** The watch screen's playback: on its own, stopping for you, and done at the end. */

function beat(over: Partial<FightBeat>): FightBeat {
  return {
    kind: 'line',
    text: 'Something happens.',
    chips: [],
    actorId: null,
    targetId: null,
    range: 'mid',
    force: null,
    health: {},
    chakra: {},
    ...over,
  };
}

const BEATS: readonly FightBeat[] = [
  beat({ kind: 'divider', text: 'First exchange' }),
  beat({ actorId: 'player', targetId: 'foe' }),
  beat({ actorId: 'foe', targetId: 'player' }),
  beat({ actorId: 'ally', targetId: 'foe' }),
];

/** Lets `ms` pass in small steps, so each beat can schedule the next as it would on screen. */
function pass(ms: number) {
  for (let left = ms; left > 0; left -= 250) {
    settle(() => {
      vi.advanceTimersByTime(250);
    });
  }
}

describe('watching a fight play (smoke test)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('plays on its own, stops when a beat comes at you, and says when it is done', () => {
    const done: string[] = [];
    const onDone = () => done.push('done');
    const { result } = renderHook(() =>
      usePlayback({ beats: BEATS, youId: 'player', fresh: true, onDone }),
    );
    expect(result.current).toMatchObject({ at: 0, playing: true });
    pass(5000);
    expect(result.current).toMatchObject({ at: 2, playing: false, stoppedForYou: true });
    settle(() => {
      result.current.toggle();
    });
    pass(5000);
    expect(result.current).toMatchObject({ at: 3, done: true });
    expect(done.length).toBeGreaterThan(0);
  });

  it('plays straight through when you ask it to, and shows the end when nothing is new', () => {
    const onDone = () => undefined;
    const { result } = renderHook(() =>
      usePlayback({ beats: BEATS, youId: 'player', fresh: true, onDone }),
    );
    settle(() => {
      result.current.toggleStopForYou();
    });
    pass(10000);
    expect(result.current).toMatchObject({ done: true, stoppedForYou: false });
    const idle = renderHook(() =>
      usePlayback({ beats: BEATS, youId: 'player', fresh: false, onDone }),
    );
    expect(idle.result.current).toMatchObject({ at: 3, done: true, playing: false });
  });
});
