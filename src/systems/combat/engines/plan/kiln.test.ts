import { createRng } from '@/core';
import type { TechniqueDef } from '@/systems/techniques';

import type { CombatantSetup, CombatCall } from '../../contract';
import { kitCall } from './calling';
import { afterEmpowers } from './empower';
import { useJutsu } from './jutsu';
import { meditationEnds } from './meditation';
import { initialFighters, type Round } from './state';

/**
 * A stillness of another ladder (the kiln calm): sat into beside a summon it needs out, called
 * for from the kit like Sage Mode's toads, and running out on its own, since nothing perches to
 * renew it.
 */

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

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 600,
    maxChakra: 600,
    techniques: [],
    ...over,
  };
}

const summoning = (id: string, call: string): TechniqueDef => ({
  id,
  name: id,
  description: id,
  discipline: 'ninjutsu',
  effects: [{ verb: 'summon', power: 1, call }],
  chakraCost: 10,
  rank: 'C',
  difficulty: 60,
});

const CALL_NEWT = summoning('call-newt', 'newt');
const CALL_SALAMANDER = summoning('call-salamander', 'salamander');

const KILN_CALM: TechniqueDef = {
  id: 'kiln-calm',
  name: 'Kiln Calm',
  description: 'Stillness in the heat.',
  discipline: 'ninjutsu',
  needsCalls: ['newt'],
  effects: [
    {
      verb: 'empower',
      power: 1,
      boosts: ['ninjutsu', 'stamina'],
      opens: { ladder: 'kiln', step: 1 },
      still: true,
    },
  ],
  chakraCost: 18,
  rank: 'B',
  difficulty: 115,
};

const BOLT: TechniqueDef = {
  id: 'bolt',
  name: 'Bolt',
  description: 'A bolt.',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 20 }],
  chakraCost: 5,
  rank: 'C',
  difficulty: 60,
};

const NEWT: CombatCall = { id: 'newt', body: setup('newt'), upkeep: 2 };
const SALAMANDER: CombatCall = { id: 'salamander', body: setup('salamander'), upkeep: 6 };

function round(): Round {
  const fighters = initialFighters({
    player: setup('keeper', {
      techniques: [CALL_NEWT, CALL_SALAMANDER, KILN_CALM, BOLT],
      calls: [NEWT, SALAMANDER],
    }),
    allies: [],
    enemies: [setup('foe', { techniques: [BOLT] })],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents: {} };
}

const keeper = (r: Round) => r.fighters.find((f) => f.id === 'keeper')!;
const step = (r: Round): Round => {
  const card = kitCall(keeper(r), { ...r, band: r.range });
  return card?.kind === 'jutsu'
    ? useJutsu(r, { actor: keeper(r), target: undefined, rng: createRng(1) }, card.technique)
    : r;
};

const sitStill = (r: Round): Round =>
  useJutsu(r, { actor: keeper(r), target: undefined, rng: createRng(1) }, KILN_CALM);

describe('the kiln calm', () => {
  it('calls the summon it needs from the kit, then is sat into and opens', () => {
    const first = step(round());
    expect(keeper(first).summonsOut).toEqual(['newt']);
    const second = sitStill(first);
    expect(keeper(second).meditating).toMatchObject({ techniqueId: 'kiln-calm' });
    const open = meditationEnds(second, 'keeper');
    expect(keeper(open).empowered?.opened).toEqual({ ladder: 'kiln', step: 1 });
    expect(open.lines.join(' ')).toMatch(/glows like the mouth of a kiln/);
  });

  it('runs out after a few exchanges, with nothing perched to keep it', () => {
    const open = meditationEnds(sitStill(step(round())), 'keeper');
    const faded = afterEmpowers(open, 8);
    expect(keeper(faded).empowered).toBeUndefined();
    expect(faded.lines.join(' ')).toMatch(/kiln calm cools/);
  });
});
