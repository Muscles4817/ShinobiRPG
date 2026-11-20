import { createRng } from '@/core';

import type { CombatantSetup, CombatAttributes, CombatTechnique } from '../../contract';
import { createPlanEngine } from './engine';
import { roundPreview } from './roundPreview';
import { decode, encode, plainSlots, type PlanState } from './state';

/** The plan screen's preview: what your plan should play each exchange, and why. */

const stats = (over: Partial<CombatAttributes> = {}): CombatAttributes => ({
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
  ...over,
});

const fireball: CombatTechnique = {
  id: 'fireball',
  name: 'Fireball',
  discipline: 'ninjutsu',
  reach: ['mid', 'far'],
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 20,
};

const setup = (id: string, over: Partial<CombatantSetup> = {}): CombatantSetup => ({
  id,
  name: id,
  attributes: stats(),
  health: 100,
  maxHealth: 100,
  chakra: 30,
  maxChakra: 30,
  techniques: [],
  ...over,
});

function planning(foe: CombatantSetup, keepAt?: 'far', keepTrying?: 'always'): PlanState {
  const engine = createPlanEngine();
  const state = decode(
    engine.start(
      {
        player: setup('you', { techniques: [fireball] }),
        allies: [],
        enemies: [foe],
        canFlee: true,
        opening: { range: 'mid' },
      },
      createRng(1),
    ),
  );
  const [you, ...rest] = state.fighters;
  const planned = {
    ...you!,
    loadout: { close: [], mid: plainSlots(['jutsu:fireball', 'throw']), far: [] },
    ...(keepAt ? { keepAt } : {}),
    ...(keepTrying ? { keepTrying } : {}),
  };
  return decode(encode({ ...state, range: 'mid', fighters: [planned, ...rest] }));
}

describe('the round preview', () => {
  it('shows four exchanges, the first choice first, and a later one when it can’t be paid for', () => {
    const preview = roundPreview(planning(setup('foe')));
    expect(preview).toHaveLength(4);
    expect(preview[0]).toMatchObject({ exchange: 1, play: 'Fireball', from: 'First choice' });
    // Thirty chakra pays for one Fireball; the next exchange falls to the throw.
    expect(preview[1]?.from).toBe('Second choice');
    expect(preview[1]?.passed?.[0]).toMatch(/^Fireball: /);
  });

  it('says a step towards where you fight is hard against a much faster foe', () => {
    const fast = setup('foe', { attributes: stats({ speed: 40 }) });
    const preview = roundPreview(planning(fast, 'far', 'always'));
    expect(preview[0]?.from).toBe('Fight at: before your slots');
    expect(preview[0]?.note).toMatch(/likely fails/);
  });

  it('fights where it stands while the odds of getting there are poor, as suggested', () => {
    const fast = setup('foe', { attributes: stats({ speed: 40 }) });
    const preview = roundPreview(planning(fast, 'far'));
    expect(preview[0]).toMatchObject({ play: 'Fireball', from: 'First choice' });
  });
});
