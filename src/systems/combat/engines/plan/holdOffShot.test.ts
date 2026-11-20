import { createRng } from '@/core';

import type { CombatantSetup, CombatAttributes, CombatTechnique, RangeBand } from '../../contract';
import { distanceBetween } from './distance';
import { holdOffChoices } from './zoning';
import { step } from './steps';
import { initialFighters, type Round } from './state';

/** Holding someone off: a hit isn't a stop, and what is thrown and how far matters. */

const base: CombatAttributes = {
  strength: 15,
  speed: 15,
  stamina: 15,
  chakraControl: 15,
  intellect: 15,
  perception: 15,
  willpower: 15,
  taijutsu: 15,
  ninjutsu: 15,
  genjutsu: 15,
  kenjutsu: 15,
  fuuinjutsu: 15,
};

const heavy: CombatTechnique = {
  id: 'heavy',
  name: 'Heavy Shot',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 40 }],
  chakraCost: 10,
  reach: ['mid', 'far'],
};

const SEEDS = 200;
const SHURIKEN = { id: 'shuriken', name: 'Shuriken', effect: 'volley' as const, count: 9 };

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes: base,
    health: 100,
    maxHealth: 100,
    chakra: 200,
    maxChakra: 200,
    techniques: [],
    ...overrides,
  };
}

interface Bout {
  readonly range: RangeBand;
  /** What the holder keeps ready: the kunai card, shuriken, or a technique. */
  readonly with: string;
  readonly holder?: Partial<CombatantSetup>;
}

function bout({ range, with: card, holder = {} }: Bout): Round {
  const holdOff = { close: null, mid: card, far: card };
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('holder', { items: [SHURIKEN], techniques: [heavy], ...holder })],
    canFlee: true,
  }).map((f) => (f.id === 'holder' ? { ...f, holdOff } : f));
  return { number: 1, fighters, range, lines: [], seen: {}, intents: {} };
}

function stepsIn(b: Bout): Round[] {
  return Array.from({ length: SEEDS }, (_, i) => {
    const round = bout(b);
    const [hero, holder] = round.fighters;
    return step(round, { actor: hero!, target: holder, rng: createRng(i + 1) }, 'in');
  });
}

const hurt = (r: Round) => (r.fighters.find((f) => f.id === 'hero')?.health ?? 100) < 100;
const stoppedAt = (r: Round, range: RangeBand) => distanceBetween(r, 'hero', 'holder') === range;
const share = (rounds: readonly Round[], test: (r: Round) => boolean) =>
  rounds.filter(test).length / rounds.length;

describe('holding someone off', () => {
  it('a volley of shuriken meets a closer more often than one kunai, and seldom stops them', () => {
    const volley = stepsIn({ range: 'mid', with: 'item:shuriken' });
    const kunai = stepsIn({ range: 'mid', with: 'throw' });
    expect(share(volley, hurt)).toBeGreaterThan(share(kunai, hurt));
    // Hit, and still they come in: the volley is light.
    const tookItAndCame = volley.filter((r) => hurt(r) && !stoppedAt(r, 'mid'));
    expect(tookItAndCame.length).toBeGreaterThan(0);
    expect(share(volley, (r) => hurt(r) && stoppedAt(r, 'mid'))).toBeLessThan(0.1);
  });

  it('a single kunai across the far gap almost never finds an equal, but a fine thrower’s does', () => {
    const plain = stepsIn({ range: 'far', with: 'throw' });
    expect(share(plain, hurt)).toBeLessThan(0.06);
    const skilled = { attributes: { ...base, kenjutsu: 40, perception: 40 } };
    const fine = stepsIn({ range: 'far', with: 'throw', holder: skilled });
    expect(share(fine, hurt)).toBeGreaterThan(share(plain, hurt) * 3);
  });

  it('a heavy hit stops whoever it meets', () => {
    const rounds = stepsIn({ range: 'mid', with: 'jutsu:heavy' });
    const struck = rounds.filter(hurt);
    expect(struck.length).toBeGreaterThan(0);
    for (const r of struck) expect(stoppedAt(r, 'mid')).toBe(true);
  });

  it('spends a handful of shuriken for every volley, and with none left they aren’t a choice', () => {
    const [after] = stepsIn({ range: 'mid', with: 'item:shuriken' });
    const holder = after!.fighters.find((f) => f.id === 'holder')!;
    expect(holder.items.find((i) => i.id === 'shuriken')?.count).toBe(SHURIKEN.count - 1);
    const empty = { ...holder, items: [{ ...SHURIKEN, count: 0 }] };
    expect(holdOffChoices(empty, 'mid').some((c) => c.kind === 'item')).toBe(false);
  });
});
