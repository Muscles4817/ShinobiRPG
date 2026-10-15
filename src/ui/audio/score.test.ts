import { MUSIC_MOODS } from '@/game';

import { LOOPS } from './loops';
import { degreeFreq, eventsAt, hashUnit, IN, STEPS_PER_BAR, type Loop } from './score';

const PATTERN = /^[0-9a-exo.-]+$/;

const loop: Loop = {
  bpm: 60,
  root: 69,
  scale: IN,
  layers: [{ instrument: 'koto', octave: 0, gain: 0.5, bars: ['0-..x.o.5.......'] }],
};

describe('the score', () => {
  it('reads degrees up the scale and past the octave', () => {
    expect(degreeFreq(loop, 0, 0)).toBeCloseTo(440);
    expect(degreeFreq(loop, 0, 5)).toBeCloseTo(880);
    expect(degreeFreq(loop, -1, 0)).toBeCloseTo(220);
  });

  it('holds a note through its dashes, and plays soft hits softer', () => {
    expect(eventsAt(loop, 0)).toEqual([
      { instrument: 'koto', freq: expect.closeTo(440) as number, gain: 0.5, steps: 2 },
    ]);
    expect(eventsAt(loop, 1)).toEqual([]);
    expect(eventsAt(loop, 6)[0]?.gain).toBeCloseTo(0.275);
  });

  it('varies a layer only after its first time round, the same way every time', () => {
    const restless: Loop = { ...loop, layers: [{ ...loop.layers[0]!, vary: 1 }] };
    expect(eventsAt(restless, 8)).toEqual(eventsAt(loop, 8));
    const later = 8 + STEPS_PER_BAR * 3;
    expect(eventsAt(restless, later)).toEqual(eventsAt(restless, later));
    expect(hashUnit(1, 2, 3)).toBe(hashUnit(1, 2, 3));
  });

  it('has a loop for every mood, written in whole bars', () => {
    for (const mood of MUSIC_MOODS) {
      for (const layer of LOOPS[mood].layers) {
        for (const bar of layer.bars) {
          expect(bar).toHaveLength(STEPS_PER_BAR);
          expect(bar).toMatch(PATTERN);
        }
      }
    }
  });
});
