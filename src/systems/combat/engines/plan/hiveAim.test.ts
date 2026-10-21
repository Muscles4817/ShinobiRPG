import type { TechniqueDef } from '@/systems/techniques';

import type { CombatantSetup } from '../../contract';
import type { CombatSwarm } from '../../swarmContract';
import { initialFighters, type PlanFighter } from './state';
import { bestTarget, targetWorth } from './targeting';
import { cardWorth } from './worth';

/** Foes and teammates aim areas and feared elements at a hive on purpose. */

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

const STONE: TechniqueDef = {
  ...FIRESTORM,
  id: 'stone-spike',
  name: 'Stone Spike',
  element: 'earth',
  effects: [{ verb: 'damage', power: 14 }],
};

const HIVE: CombatSwarm = {
  strain: {
    name: 'moths',
    qualities: { speed: 3, bite: 3, toughness: 1, brood: 3, size: 3, senses: 3 },
    gifts: { drain: 1 },
    fears: ['fire'],
  },
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

function fighters(attacker: Partial<CombatantSetup>) {
  return initialFighters({
    player: setup('host', { swarm: HIVE }),
    allies: [setup('plain')],
    enemies: [setup('foe', attacker)],
    canFlee: true,
  });
}

function by(all: readonly PlanFighter[], id: string): PlanFighter {
  const found = all.find((f) => f.id === id);
  if (!found) throw new Error(`No fighter ${id}`);
  return found;
}

describe('aiming at a hive', () => {
  it('reckons fire worth more against a host whose insects fear it', () => {
    const all = fighters({ techniques: [FIRESTORM] });
    const card = { kind: 'jutsu', technique: FIRESTORM } as const;
    const where = { band: 'mid' as const, fighters: all };
    const onHost = cardWorth(by(all, 'foe'), by(all, 'host'), card, where)!;
    const onPlain = cardWorth(by(all, 'foe'), by(all, 'plain'), card, where)!;
    expect(onHost).toBeGreaterThan(onPlain);
  });

  it('goes for the host when it carries what kills insects, and not otherwise', () => {
    const burning = fighters({ techniques: [FIRESTORM] });
    const foe = by(burning, 'foe');
    const pair = [by(burning, 'plain'), by(burning, 'host')];
    expect(targetWorth(foe, by(burning, 'host'))).toBeGreaterThan(
      targetWorth(foe, by(burning, 'plain')),
    );
    expect(bestTarget(foe, pair)?.id).toBe('host');
    const stony = fighters({ techniques: [STONE] });
    const plainFoe = by(stony, 'foe');
    expect(targetWorth(plainFoe, by(stony, 'host'))).toBe(
      targetWorth(plainFoe, by(stony, 'plain')),
    );
  });
});
