import { createRng } from '@/core';
import type { TechniqueDef } from '@/systems/techniques';

import type { CombatantSetup } from '../../contract';
import type { CombatDust } from '../../dustContract';
import { BLIND_EXCHANGES } from '../../rules/dust';
import { playable } from './cards';
import { createPlanEngine } from './engine';
import {
  blindedSlips,
  dustAfter,
  dustGrip,
  dustLanded,
  dustMeter,
  dustSpent,
  dustStruck,
} from './dust';
import { fighterIn, initialFighters, type Round } from './state';

/** Commanded dust in a planned fight: spent and drawn, cutting and blinding, scattered by banes. */

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

const BURIAL: TechniqueDef = {
  id: 'dust-burial',
  name: 'Dust Burial',
  description: 'Dust closes over a foe.',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 4,
  dustCost: 30,
  rank: 'E',
  difficulty: 30,
};

const GATHER: TechniqueDef = {
  ...BURIAL,
  id: 'dust-gather',
  name: 'Dust Gathering',
  dustCost: 0,
  dustDraw: 40,
};

const SAND: CombatDust = {
  kind: {
    name: 'sand',
    qualities: { weight: 3, hold: 5, draw: 3 },
    gifts: { cutting: 2, blinding: 2 },
    banes: ['water'],
    drawnOn: ['arena'],
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

function round(dust: CombatDust = SAND): Round {
  const fighters = initialFighters({
    player: setup('user', { techniques: [BURIAL, GATHER], dust }),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const user = (r: Round) => fighterIn(r, 'user')!;
const foe = (r: Round) => fighterIn(r, 'foe')!;

describe('dust in a planned fight', () => {
  it('a dust technique needs the dust it spends, and spends it', () => {
    const card = { kind: 'jutsu', technique: BURIAL } as const;
    expect(playable(user(round()), card)).toBe(true);
    expect(playable(user(round({ ...SAND, count: 10 })), card)).toBe(false);
    expect(dustSpent(user(round()), BURIAL).dust?.count).toBe(70);
  });

  it('a draw pulls dust back up from the ground', () => {
    const thin = user(round({ ...SAND, count: 20 }));
    expect(dustSpent(thin, GATHER, 'arena').dust!.count).toBeGreaterThan(20);
  });

  it('a firm hold grips its pins harder', () => {
    expect(dustGrip(user(round()), BURIAL)).toBeGreaterThan(1);
    expect(dustGrip(foe(round()), BURIAL)).toBe(1);
  });

  it('cutting dust leaves a bleed and blinding dust gets in the eyes, then wears off', () => {
    let r = dustLanded(round(), user(round()), 'foe', BURIAL);
    expect(foe(r).afflictions?.some((a) => a.harm === 'bleed')).toBe(true);
    expect(blindedSlips(foe(r))).toBeGreaterThan(1);
    for (let i = 0; i < BLIND_EXCHANGES; i += 1) r = dustAfter(r);
    expect(foe(r).blinded).toBeUndefined();
  });

  it('water scatters sand; fire does not', () => {
    const soaked = dustStruck(round(), 'user', { damage: 20, element: 'water', physical: false });
    expect(user(soaked).dust!.count).toBeLessThan(100);
    const burnt = dustStruck(round(), 'user', { damage: 20, element: 'fire', physical: false });
    expect(user(burnt).dust!.count).toBe(100);
  });

  it('shows the player’s dust as a meter', () => {
    expect(dustMeter(user(round()))).toEqual({ id: 'dust', label: 'Dust', value: 100, max: 100 });
    expect(dustMeter(foe(round()))).toBeNull();
  });

  it('plays dust techniques in a whole fight and reports what is left', () => {
    const engine = createPlanEngine();
    const start = engine.start(
      {
        player: setup('user', { techniques: [BURIAL, GATHER], dust: SAND }),
        allies: [],
        enemies: [setup('foe', { health: 300, maxHealth: 300 })],
        canFlee: false,
        watch: true,
      },
      createRng(4),
    );
    const done = engine.act(start, { optionId: 'finish' }, createRng(5));
    if (!done.ok) throw new Error(done.error);
    const left = engine.outcome(done.value)?.dust;
    expect(left).toBeDefined();
    expect(left).toBeLessThanOrEqual(SAND.cap);
  });
});
