import { createRng } from '@/core';
import type { TechniqueDef } from '@/systems/techniques';

import type { CombatantSetup, CombatCall } from '../../contract';
import { createPlanEngine } from './engine';
import { withThinking } from './mind/planner/think';
import { presentAtStart } from './present';
import { decode, initialFighters, type Round } from './state';

/** Bodies that stand with their caller as the fight begins, and who thinks ahead in a watched bout. */

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

const BLOW: TechniqueDef = {
  id: 'rod-strike',
  name: 'Rod Strike',
  description: 'A chakra rod driven in.',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 0,
  rank: 'E',
  difficulty: 10,
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
    techniques: [BLOW],
    ...over,
  };
}

const PATH: CombatCall = {
  id: 'path',
  body: setup('path', { name: 'A path' }),
  upkeep: 4,
  shared: true,
  present: true,
};
const CALLED: CombatCall = { id: 'called', body: setup('called'), upkeep: 4 };

const fightSetup = { calls: [PATH, CALLED] };

function round(): Round {
  const fighters = initialFighters({
    player: setup('caller', fightSetup),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents: {} };
}

describe('bodies present from the start', () => {
  it('stand beside their caller, of their mind, with a plan, and nothing else is called', () => {
    const opened = presentAtStart(round());
    const bodies = opened.fighters.filter((f) => f.summoner === 'caller');
    expect(bodies.map((b) => b.callId)).toEqual(['path']);
    expect(bodies[0]?.side).toBe('player');
    expect(bodies[0]?.mind?.id).toBeDefined();
    const { close, mid, far } = bodies[0]!.loadout;
    expect(close.length + mid.length + far.length).toBeGreaterThan(0);
    const caller = opened.fighters.find((f) => f.id === 'caller')!;
    expect(caller.summonsOut).toEqual(['path']);
    expect(caller.health).toBe(100);
    expect(opened.lines.join(' ')).toMatch(/A path stands with caller/);
  });

  it('are on the field as the engine opens the fight', () => {
    const state = createPlanEngine().start(
      { player: setup('caller', fightSetup), allies: [], enemies: [setup('foe')], canFlee: true },
      createRng(1),
    );
    expect(decode(state).fighters.some((f) => f.callId === 'path')).toBe(true);
  });
});

describe('thinking ahead', () => {
  const fighters = initialFighters({
    player: setup('you'),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  const thinkers = (watched: boolean) =>
    withThinking(fighters, { on: true, watched })
      .filter((f) => f.thinks)
      .map((f) => f.side);

  it('is the foes’ alone in a fight you plan, and both sides’ in one you only watch', () => {
    expect(thinkers(false)).toEqual(['enemy']);
    expect(thinkers(true)).toEqual(['player', 'enemy']);
    expect(withThinking(fighters, { on: false, watched: true }).some((f) => f.thinks)).toBe(false);
  });
});
