import { textOf } from '@/test/fightLines';
import type { CombatantSetup, CombatTechnique } from '../../contract';
import { stillFree, sunkIn } from './oneNightmare';
import { initialFighters, type PlanFighter, type Round } from './state';

/** One mind, one nightmare: an illusion holds once a mind on a target each exchange. */

const base: CombatantSetup['attributes'] = {
  strength: 15,
  speed: 15,
  stamina: 15,
  chakraControl: 15,
  intellect: 15,
  perception: 15,
  willpower: 15,
  taijutsu: 15,
  ninjutsu: 15,
  genjutsu: 30,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const nightmare: CombatTechnique = {
  id: 'nightmare',
  name: 'Nightmare',
  discipline: 'genjutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 10,
};
const fireball: CombatTechnique = {
  ...nightmare,
  id: 'fireball',
  name: 'Fireball',
  discipline: 'ninjutsu',
};

const setup = (id: string): CombatantSetup => ({
  id,
  name: id,
  attributes: base,
  health: 100,
  maxHealth: 100,
  chakra: 80,
  maxChakra: 80,
  techniques: [nightmare, fireball],
});

function table(): {
  round: Round;
  maker: PlanFighter;
  clone: PlanFighter;
  other: PlanFighter;
  foe: PlanFighter;
} {
  const fighters = initialFighters({
    player: setup('maker'),
    allies: [setup('clone'), setup('other')],
    enemies: [setup('foe')],
    canFlee: false,
  }).map((f) => (f.id === 'clone' ? { ...f, shadowOf: 'maker' } : f));
  const at = (id: string) => fighters.find((f) => f.id === id)!;
  const round: Round = { number: 1, fighters, range: 'mid', story: [], seen: {}, intents: {} };
  return { round, maker: at('maker'), clone: at('clone'), other: at('other'), foe: at('foe') };
}

describe('one mind, one nightmare', () => {
  it('a shadow clone’s illusion adds nothing to one its maker already sank in this exchange', () => {
    const { round, maker, clone, foe } = table();
    const sunk = sunkIn(round, maker, { t: nightmare, reached: [foe] });
    const again = stillFree(sunk, clone, { t: nightmare, targets: [foe] });
    expect(again.targets).toEqual([]);
    expect(textOf(again.round.story).at(-1)).toContain('already lost in');
  });

  it('another mind’s illusion, or anything that isn’t an illusion, still takes', () => {
    const { round, maker, clone, other, foe } = table();
    const sunk = sunkIn(round, maker, { t: nightmare, reached: [foe] });
    expect(stillFree(sunk, other, { t: nightmare, targets: [foe] }).targets).toEqual([foe]);
    expect(stillFree(sunk, clone, { t: fireball, targets: [foe] }).targets).toEqual([foe]);
  });

  it('holds only for the exchange: a fresh exchange starts with no illusions sunk', () => {
    const { round, clone, foe } = table();
    expect(stillFree(round, clone, { t: nightmare, targets: [foe] }).targets).toEqual([foe]);
  });
});
