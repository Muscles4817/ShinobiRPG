import type { CombatantSetup, CombatTechnique } from '../../contract';
import { plannedFighters } from './planning';
import { setsOthersUp } from './roles';
import { initialFighters } from './state';

/** Reading the matchup: outclassed in your best art, with a teammate who isn't, you set them up. */

function setup(
  id: string,
  arts: { ninjutsu: number; taijutsu: number },
  t: CombatTechnique[] = [],
): CombatantSetup {
  return {
    id,
    name: id,
    attributes: {
      strength: 20,
      speed: 20,
      stamina: 20,
      chakraControl: 20,
      intellect: 30,
      perception: 20,
      willpower: 20,
      genjutsu: 10,
      kenjutsu: 10,
      fuuinjutsu: 10,
      ...arts,
    },
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques: t,
  };
}

const bullet: CombatTechnique = {
  id: 'bullet',
  name: 'Bullet',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 18 }],
  chakraCost: 10,
};
const prison: CombatTechnique = {
  id: 'prison',
  name: 'Prison',
  discipline: 'ninjutsu',
  effects: [{ verb: 'pin', power: 10 }],
  chakraCost: 10,
};

function fight(caster: { ninjutsu: number; taijutsu: number }) {
  return initialFighters({
    player: setup('brawler', { ninjutsu: 5, taijutsu: 40 }),
    allies: [setup('caster', caster, [bullet, prison])],
    enemies: [setup('master', { ninjutsu: 45, taijutsu: 30 })],
    canFlee: true,
  });
}

describe('reading the matchup', () => {
  it('a caster outclassed in their art, beside a brawler who isn’t, sets the brawler up', () => {
    const fighters = fight({ ninjutsu: 30, taijutsu: 10 });
    expect(
      setsOthersUp(
        fighters.find((f) => f.id === 'caster')!,
        fighters,
      ),
    ).toBe(true);
    expect(
      setsOthersUp(
        fighters.find((f) => f.id === 'brawler')!,
        fighters,
      ),
    ).toBe(false);
  });

  it('a caster who holds their own fights as usual', () => {
    const fighters = fight({ ninjutsu: 40, taijutsu: 10 });
    expect(
      setsOthersUp(
        fighters.find((f) => f.id === 'caster')!,
        fighters,
      ),
    ).toBe(false);
  });

  it('with no teammate who stands a chance, there is no one to set up', () => {
    const alone = initialFighters({
      player: setup('caster', { ninjutsu: 30, taijutsu: 10 }),
      allies: [],
      enemies: [setup('master', { ninjutsu: 45, taijutsu: 30 })],
      canFlee: true,
    });
    expect(setsOthersUp(alone[0]!, alone)).toBe(false);
  });

  it('leads the outclassed one’s plan with a pure hold rather than their blows', () => {
    const planned = plannedFighters(fight({ ninjutsu: 30, taijutsu: 10 }), undefined);
    const caster = planned.find((f) => f.id === 'caster')!;
    const mid = caster.loadout.mid.map((s) => s.card);
    expect(mid.indexOf('jutsu:prison')).toBeLessThan(mid.indexOf('jutsu:bullet'));
  });
});
