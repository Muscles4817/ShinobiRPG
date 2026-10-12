import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { useJutsu } from './jutsu';
import { fighterIn, initialFighters, type PlanFighter, type Round } from './state';

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 20,
  chakraControl: 5,
  intellect: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 30,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

/** Hits, then dazes what it hit. */
const crush: CombatTechnique = {
  id: 'crush',
  name: 'Crush',
  discipline: 'taijutsu',
  effects: [
    { verb: 'damage', power: 10 },
    { verb: 'daze', power: 6 },
  ],
  chakraCost: 6,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 80,
    maxHealth: 80,
    chakra: 30,
    maxChakra: 30,
    techniques: [crush],
    ...overrides,
  };
}

function roundWith(target: Partial<CombatantSetup> = {}, loadout?: PlanFighter['loadout']) {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('bandit', { techniques: [], ...target })],
    canFlee: true,
  }).map((f) => (loadout && f.id === 'bandit' ? { ...f, loadout } : f));
  const round: Round = {
    number: 1,
    fighters,
    range: 'close',
    lines: [],
    seen: {},
    intents: {},
  };
  return round;
}

/** Uses Crush with each seed in turn until the narration matches. */
function crushUntil(round: Round, wanted: RegExp): Round {
  for (let seed = 1; seed < 200; seed++) {
    const [actor, target] = round.fighters;
    const after = useJutsu(round, { actor: actor!, target, rng: createRng(seed) }, crush);
    if (after.lines.some((l) => wanted.test(l))) return after;
  }
  throw new Error(`no seed narrates ${wanted.source}`);
}

describe('plan & watch techniques', () => {
  it('apply their effects in order: the blow lands, then the daze', () => {
    const after = crushUntil(roundWith(), /hits bandit/);
    const bandit = fighterIn(after, 'bandit');
    expect(bandit?.health).toBeLessThan(80);
    expect(bandit?.stunned).toBe(1);
    const said = after.lines.join(' ');
    expect(said.indexOf('hits bandit')).toBeLessThan(said.indexOf('bandit is dazed'));
  });

  it('miss entirely when the target sees them coming', () => {
    const watchful = { attributes: { ...attributes, perception: 60 } };
    const after = crushUntil(roundWith(watchful), /sees it coming/);
    expect(fighterIn(after, 'bandit')).toMatchObject({ health: 80, stunned: 0 });
  });

  it('stop at a slipped blow: what follows it misses too', () => {
    const nimble = { attributes: { ...attributes, speed: 60 }, traits: ['swift' as const] };
    const dodging = { close: ['dodge'], mid: [], far: [] };
    const after = crushUntil(roundWith(nimble, dodging), /slips past/);
    expect(fighterIn(after, 'bandit')).toMatchObject({ health: 80, stunned: 0 });
    expect(after.lines.join(' ')).not.toMatch(/dazed/);
  });
});
