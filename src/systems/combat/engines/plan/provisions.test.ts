import { createRng } from '@/core';
import type { TechniqueEffect } from '@/systems/techniques';

import type { CombatantSetup, CombatProvision, CombatTechnique } from '../../contract';
import { SECOND_WIND_HEAL, STEADY_THROUGH_EXCHANGE } from '../../rules/provisions';
import { useJutsu } from './jutsu';
import { secondWinds } from './provisions';
import { canDaze, fighterIn, initialFighters, patch, type Round } from './state';

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

function setup(id: string, provisions: readonly CombatProvision[] = []): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 20,
    maxChakra: 60,
    techniques: [],
    provisions,
  };
}

function roundWith(provisions: readonly CombatProvision[]): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('bandit', provisions)],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const bandit = (round: Round) => fighterIn(round, 'bandit')!;

describe('provisions in Plan & Watch', () => {
  it('a fortifying meal tops up chakra as the fight opens', () => {
    expect(bandit(roundWith([])).chakra).toBe(20);
    expect(bandit(roundWith(['fortified'])).chakra).toBe(35);
  });

  it('a steadying meal keeps a daze off through the opening exchanges', () => {
    const steady = bandit(roundWith(['steady']));
    expect(canDaze(steady, STEADY_THROUGH_EXCHANGE)).toBe(false);
    expect(canDaze(steady, STEADY_THROUGH_EXCHANGE + 1)).toBe(true);
    expect(canDaze(bandit(roundWith([])), 1)).toBe(true);
  });

  it('an antidote makes a fresh harm wear off sooner', () => {
    const fire = (effects: readonly TechniqueEffect[]): CombatTechnique => ({
      id: 'fire',
      name: 'Fire',
      discipline: 'ninjutsu',
      effects,
      chakraCost: 2,
    });
    const burn = fire([{ verb: 'afflict', power: 10, harm: 'burn' }]);
    const lasting = (provisions: readonly CombatProvision[]) => {
      for (let seed = 1; seed < 100; seed++) {
        const round = roundWith(provisions);
        const [hero, target] = round.fighters;
        const after = useJutsu(round, { actor: hero!, target, rng: createRng(seed) }, burn);
        const harm = bandit(after).afflictions?.[0];
        if (harm) return harm.exchanges;
      }
      return 0;
    };
    expect(lasting(['antidote'])).toBe(lasting([]) - 1);
  });

  it('a second wind comes once, to the badly hurt', () => {
    const start = roundWith(['second-wind']);
    const hurt = { ...start, fighters: patch(start.fighters, 'bandit', { health: 20 }) };
    const winded = secondWinds(hurt);
    expect(bandit(winded).health).toBe(20 + SECOND_WIND_HEAL);
    expect(winded.lines.at(-1)).toContain('finds a second wind');
    const again = { ...winded, fighters: patch(winded.fighters, 'bandit', { health: 10 }) };
    expect(bandit(secondWinds(again)).health).toBe(10);
    const healthy = secondWinds(start);
    expect(healthy.lines).toEqual([]);
  });
});
