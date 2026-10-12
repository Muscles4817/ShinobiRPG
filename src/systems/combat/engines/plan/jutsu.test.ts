import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { UNSTABLE_MISFIRE } from '../../rules/unstable';
import { chooseCard } from './choose';
import { useJutsu } from './jutsu';
import {
  fighterIn,
  initialFighters,
  canDaze,
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

  it('a daze can’t be chained: the target is steady for an exchange after it wears off', () => {
    const after = crushUntil(roundWith(), /bandit is dazed/);
    const bandit = fighterIn(after, 'bandit')!;
    expect(canDaze(bandit, after.number + 1)).toBe(false);
    const recovered = wearOffDaze({ ...bandit, stunned: 0 }, after.number + 1);
    expect(isDazed(recovered)).toBe(false);
    expect(canDaze(recovered, after.number + 2)).toBe(false);
    expect(canDaze(recovered, after.number + 3)).toBe(true);
    const steady = {
      ...after,
      number: after.number + 2,
      fighters: after.fighters.map((f) => (f.id === 'bandit' ? recovered : f)),
    };
    const again = crushUntil(steady, /shakes it off/);
    expect(fighterIn(again, 'bandit')?.stunned).toBe(0);
  });

  it('a dazed fighter can still guard, but not dodge', () => {
    const nimble = { attributes: { ...attributes, speed: 60 }, traits: ['swift' as const] };
    const both = { close: plainSlots(['dodge', 'guard']), mid: [], far: [] };
    const round = roundWith(nimble, both);
    const reeling = {
      ...round,
      fighters: round.fighters.map((f) =>
        f.id === 'bandit' ? { ...f, stunned: 1, openUntil: 2 } : f,
      ),
    };
    const [hero, bandit] = reeling.fighters;
    for (let seed = 1; seed <= 30; seed++) {
      const after = useJutsu(reeling, { actor: hero!, target: bandit, rng: createRng(seed) }, jab);
      expect(after.lines.join(' ')).not.toMatch(/slips past/);
      if (after.lines.some((l) => l.includes('hits bandit'))) {
        expect(after.lines.join(' ')).toMatch(/through a guard/);
      }
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

  it('an unstable technique costs more and sometimes comes apart, chakra spent', () => {
    const shaky: CombatTechnique = { ...crush, unstable: true };
    const round = roundWith();
    const [hero, bandit] = round.fighters;
    const SEEDS = 400;
    let misfires = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const after = useJutsu(round, { actor: hero!, target: bandit, rng: createRng(seed) }, shaky);
      expect(fighterIn(after, 'hero')?.chakra).toBe(30 - 8);
      if (after.lines.some((l) => l.includes('comes apart'))) {
        misfires++;
        expect(fighterIn(after, 'bandit')).toMatchObject({ health: 80, stunned: 0 });
      }
    }
    expect(misfires / SEEDS).toBeGreaterThan(UNSTABLE_MISFIRE - 0.06);
    expect(misfires / SEEDS).toBeLessThan(UNSTABLE_MISFIRE + 0.06);
    for (let seed = 1; seed <= 50; seed++) {
      const after = useJutsu(round, { actor: hero!, target: bandit, rng: createRng(seed) }, crush);
      expect(after.lines.join(' ')).not.toMatch(/comes apart/);
    }
  });
});
