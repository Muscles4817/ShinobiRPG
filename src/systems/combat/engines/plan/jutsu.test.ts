import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { chooseCard } from './choose';
import { useJutsu } from './jutsu';
import {
  fighterIn,
  initialFighters,
  isDazed,
  plainSlots,
  wearOffDaze,
  type PlanFighter,
  type Round,
} from './state';

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

/** A plain hit, to finish a dazed foe with. */
const jab: CombatTechnique = {
  id: 'jab',
  name: 'Jab',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 8 }],
  chakraCost: 2,
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

  it('a daze leaves the target open until the dazer has had another turn', () => {
    const after = crushUntil(roundWith(), /bandit is dazed/);
    const bandit = fighterIn(after, 'bandit')!;
    expect(bandit.openUntil).toBe(after.number + 1);
    // The lost turn spends the daze, but the target is still reeling…
    const spent = { ...bandit, stunned: 0 };
    expect(isDazed(spent)).toBe(true);
    expect(isDazed(wearOffDaze(spent, after.number))).toBe(true);
    // …until the end of the next exchange.
    expect(isDazed(wearOffDaze(spent, after.number + 1))).toBe(false);
    // So a finisher still comes for them on the next turn, every time.
    const [hero] = after.fighters;
    const finishing = {
      ...hero!,
      techniques: [jab],
      loadout: { close: plainSlots(['strike', 'jutsu:jab']), mid: [], far: [] },
    };
    for (let seed = 1; seed <= 20; seed++) {
      const card = chooseCard(finishing, { band: 'close', foe: spent }, createRng(seed));
      expect(card).toEqual({ kind: 'jutsu', technique: jab });
    }
  });

  it('add what they cost to the chakra spent in the fight, hit or miss', () => {
    const once = crushUntil(roundWith(), /hits bandit/);
    expect(fighterIn(once, 'hero')).toMatchObject({ chakra: 24, chakraSpent: 6 });
    const [hero, bandit] = once.fighters;
    const twice = useJutsu(once, { actor: hero!, target: bandit, rng: createRng(3) }, crush);
    expect(fighterIn(twice, 'hero')).toMatchObject({ chakra: 18, chakraSpent: 12 });
    expect(fighterIn(twice, 'bandit')?.chakraSpent).toBeUndefined();
  });

  it('miss entirely when the target sees them coming', () => {
    const watchful = { attributes: { ...attributes, perception: 60 } };
    const after = crushUntil(roundWith(watchful), /sees it coming/);
    expect(fighterIn(after, 'bandit')).toMatchObject({ health: 80, stunned: 0 });
  });

  it('stop at a slipped blow: what follows it misses too', () => {
    const nimble = { attributes: { ...attributes, speed: 60 }, traits: ['swift' as const] };
    const dodging = { close: plainSlots(['dodge']), mid: [], far: [] };
    const after = crushUntil(roundWith(nimble, dodging), /slips past/);
    expect(fighterIn(after, 'bandit')).toMatchObject({ health: 80, stunned: 0 });
    expect(after.lines.join(' ')).not.toMatch(/dazed/);
  });
});
