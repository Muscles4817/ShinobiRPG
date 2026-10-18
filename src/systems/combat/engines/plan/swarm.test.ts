import { createRng } from '@/core';
import type { TechniqueDef } from '@/systems/techniques';

import type { CombatantSetup } from '../../contract';
import { SETTLE_EXCHANGES } from '../../rules/swarms';
import type { CombatSwarm } from '../../swarmContract';
import { playable } from './cards';
import { settleOn, swarmSpent, swarmStruck, swarmsAfter } from './swarm';
import { hiveMeter } from './swarmView';
import { fighterIn, initialFighters, type Round } from './state';

/** A hive in a planned fight: spent, settled on foes, burnt and thinned, and hunting the hidden. */

const attributes = {
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
};

const SWARM: TechniqueDef = {
  id: 'bite-swarm',
  name: 'Biting Swarm',
  description: 'A cloud that bites.',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 4,
  swarmCost: 20,
  rank: 'E',
  difficulty: 30,
};

const FIRESTORM: TechniqueDef = {
  id: 'firestorm',
  name: 'Firestorm',
  description: 'Flame across everyone.',
  discipline: 'ninjutsu',
  element: 'fire',
  effects: [{ verb: 'area', power: 14, size: 'wide' }],
  chakraCost: 12,
  rank: 'C',
  difficulty: 70,
};

const HIVE: CombatSwarm = {
  strain: { name: 'drainers', drain: 1, hardiness: 0, fears: ['fire'], senses: 1 },
  count: 100,
  cap: 100,
};

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...over,
  };
}

function round(swarm: CombatSwarm = HIVE): Round {
  const fighters = initialFighters({
    player: setup('host', { techniques: [SWARM], swarm, chakra: 30 }),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const host = (r: Round) => fighterIn(r, 'host')!;
const foe = (r: Round) => fighterIn(r, 'foe')!;

describe('a hive in a planned fight', () => {
  it('a swarm technique needs the insects it spends, and spends them', () => {
    const card = { kind: 'jutsu', technique: SWARM } as const;
    expect(playable(host(round()), card)).toBe(true);
    expect(playable(host(round({ ...HIVE, count: 10 })), card)).toBe(false);
    expect(swarmSpent(host(round()), SWARM).swarm?.count).toBe(80);
  });

  it('settled insects draw a foe’s chakra into their host, then drop off', () => {
    let r = settleOn(round(), 'host', [foe(round())], SWARM);
    expect(foe(r).settled?.hostId).toBe('host');
    const rng = createRng(1);
    r = swarmsAfter(r, rng);
    expect(foe(r).chakra).toBeLessThan(60);
    expect(host(r).chakra).toBeGreaterThan(30);
    for (let i = 1; i < SETTLE_EXCHANGES; i += 1) r = swarmsAfter(r, rng);
    expect(foe(r).settled).toBeUndefined();
  });

  it('fire burns settled insects off and kills insects in its host’s hive', () => {
    const settled = settleOn(round(), 'host', [foe(round())], SWARM);
    expect(foe(swarmStruck(settled, 'foe', FIRESTORM, 20)).settled).toBeUndefined();
    const burnt = swarmStruck(round(), 'host', FIRESTORM, 20);
    expect(host(burnt).swarm!.count).toBeLessThan(100);
  });

  it('a keen hive finds a hidden foe on its own', () => {
    const r = round();
    const hiding = {
      ...r,
      fighters: r.fighters.map((f) => (f.id === 'foe' ? { ...f, hidden: true } : f)),
    };
    const found = Array.from({ length: 40 }, (_, i) => i + 1).some(
      (seed) => !foe(swarmsAfter(hiding, createRng(seed))).hidden,
    );
    expect(found).toBe(true);
  });

  it('shows the player’s hive as a meter', () => {
    expect(hiveMeter(host(round()))).toEqual({ id: 'hive', label: 'Hive', value: 100, max: 100 });
    expect(hiveMeter(foe(round()))).toBeNull();
  });
});
