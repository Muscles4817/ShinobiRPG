import type { CombatantSetup, CombatAttributes } from '../../contract';
import { maxWill } from '../../rules/will';
import { initialFighters, type Round } from './state';
import { drainWill, willAfter, willMeter } from './will';

/** An ordeal of the mind wears the will down, and a mind worn to nothing gives out. */

const mind = (genjutsu: number, willpower: number): CombatAttributes => ({
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: genjutsu,
  intellect: 20,
  perception: 20,
  willpower,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu,
  kenjutsu: 20,
  fuuinjutsu: 20,
});

const setup = (id: string, attributes: CombatAttributes): CombatantSetup => ({
  id,
  name: id,
  attributes,
  health: 100,
  maxHealth: 100,
  chakra: 100,
  maxChakra: 100,
  techniques: [],
});

function facing(targetWill: number): Round {
  const [itachi, target] = initialFighters({
    player: setup('itachi', mind(50, 30)),
    allies: [],
    enemies: [setup('foe', mind(20, targetWill))],
    canFlee: true,
  });
  return {
    number: 1,
    fighters: [itachi!, target!],
    range: 'close',
    lines: [],
    seen: {},
    intents: {},
  };
}

const tsukuyomi = {
  technique: {
    id: 'tsukuyomi',
    name: 'Tsukuyomi',
    discipline: 'genjutsu' as const,
    effects: [],
    chakraCost: 0,
  },
  effect: { verb: 'drain' as const, power: 40, will: true as const },
};

function ordeal(round: Round): Round {
  const [actor, target] = round.fighters;
  return drainWill(round, { actor: actor!, target: target! }, tsukuyomi);
}

const foe = (r: Round) => r.fighters[1]!;

describe('the will', () => {
  it('breaks a weak mind at once, and its body drops', () => {
    const after = ordeal(facing(10));
    expect(foe(after).will).toBe(0);
    expect(foe(after).health).toBe(0);
  });

  it('frays a strong one, which comes back a little each exchange, and shows on its meter', () => {
    const after = ordeal(facing(45));
    const left = foe(after).will!;
    expect(left).toBeGreaterThan(0);
    expect(foe(after).health).toBe(100);
    expect(willMeter(foe(after))).toMatchObject({
      value: left,
      max: maxWill(foe(after).attributes),
    });
    expect(foe(willAfter(after)).will).toBe(left + 2);
  });

  it('is not shown before anything touches it', () => {
    expect(willMeter(foe(facing(30)))).toBeNull();
  });
});
