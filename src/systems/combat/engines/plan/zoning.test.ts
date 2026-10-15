import { createRng } from '@/core';

import { GETS_THROUGH, holdsOff } from '@/test/fightLines';
import type { CombatantSetup, CombatTechnique } from '../../contract';
import { editReadiness, readinessOptions } from './readinessTable';
import { readyDefences } from './readiness';
import { step } from './steps';
import { initialFighters, type Round } from './state';
import { defaultHoldOff } from './zoning';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 20,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 20,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const gust: CombatTechnique = {
  id: 'gust',
  name: 'Gust',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 4,
  reach: ['mid', 'far'],
};
const squall: CombatTechnique = {
  id: 'squall',
  name: 'Squall',
  discipline: 'ninjutsu',
  effects: [{ verb: 'area', power: 10, size: 'wide' }],
  chakraCost: 8,
  reach: ['mid', 'far'],
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...overrides,
  };
}

/** The hero steps in from mid range on a caster who holds off with Gust. */
function atMid(acted: readonly string[] = []): Round {
  const holdOff = { close: null, mid: 'jutsu:gust', far: 'jutsu:gust' };
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('caster', { techniques: [gust] })],
    canFlee: true,
  }).map((f) => (f.id === 'caster' ? { ...f, holdOff } : f));
  return { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents: {}, acted };
}

function stepIn(round: Round, seed: number): Round {
  const [hero, caster] = round.fighters;
  return step(round, { actor: hero!, target: caster, rng: createRng(seed) }, 'in');
}

describe('holding a foe off', () => {
  it('a step in meets the holder’s fire: held off and hit, or slipping through and closing in', () => {
    const results = Array.from({ length: 60 }, (_, i) => stepIn(atMid(), i + 1));
    const held = results.filter((r) => r.lines.some((l) => holdsOff('caster', 'hero').test(l)));
    const through = results.filter((r) => r.lines.some((l) => GETS_THROUGH.test(l)));
    expect(held.length).toBeGreaterThan(0);
    expect(through.length).toBeGreaterThan(0);
    for (const r of held) expect(r.range).toBe('mid');
    for (const r of through) expect(r.range).toBe('close');
    // Holding off is the holder's turn.
    for (const r of [...held, ...through]) expect(r.acted).toContain('caster');
  });

  it('a holder who has already acted this exchange can’t', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const after = stepIn(atMid(['caster']), seed);
      expect(after.lines.join(' ')).not.toMatch(
        new RegExp(`${holdsOff('caster', 'hero').source}|${GETS_THROUGH.source}`),
      );
    }
  });

  it('on the move, a fighter can’t set a Guard, but a Dodge still works', () => {
    const moved = stepIn(atMid(['caster']), 1);
    const hero = moved.fighters.find((f) => f.id === 'hero')!;
    const at = { range: moved.range, number: moved.number };
    const guarding = { ...hero, reactions: { close: 'guard', mid: 'guard', far: 'guard' } };
    const dodging = { ...hero, reactions: { close: 'dodge', mid: 'dodge', far: 'dodge' } };
    expect(readyDefences(guarding, at)).toEqual([]);
    expect(readyDefences(dodging, at)).toEqual([{ kind: 'dodge' }]);
    expect(readyDefences(guarding, { ...at, number: at.number + 1 })).toEqual([{ kind: 'guard' }]);
  });
});

describe('the hold-off setting', () => {
  const caster = () =>
    initialFighters({
      player: setup('hero', { techniques: [gust, squall], row: 'back' }),
      allies: [],
      enemies: [setup('bandit')],
      canFlee: true,
    })[0]!;

  it('someone who fights from range holds off with their strongest area by default', () => {
    expect(defaultHoldOff(caster())).toEqual({
      close: null,
      mid: 'jutsu:squall',
      far: 'jutsu:squall',
    });
  });

  it('is offered at mid and far, never close, and picking one sets it', () => {
    const hero = caster();
    const held = (band: 'close' | 'mid') =>
      readinessOptions(hero, band).filter((o) => o.setting === 'Hold off');
    expect(held('close')).toEqual([]);
    expect(held('mid').map((o) => o.label)).toContain('Nothing');
    const edited = editReadiness({ fighters: [hero] }, hero, 'hold:mid:none');
    expect(edited?.fighters[0]?.holdOff?.mid).toBeNull();
  });
});
