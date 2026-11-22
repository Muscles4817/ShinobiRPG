import type { CombatantSetup } from '../../contract';
import { pooledAfter, pooledFrom } from './pooled';
import { initialFighters, type PlanFighter, type Round } from './state';

/** Bodies with no chakra of their own spend their caller's. */

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

const setup = (id: string, chakra: number): CombatantSetup => ({
  id,
  name: id,
  attributes,
  health: 100,
  maxHealth: 100,
  chakra,
  maxChakra: chakra,
  techniques: [],
});

describe('pooled bodies', () => {
  it('hold what their caller holds, and what they spend comes off the caller', () => {
    const [caller, path] = initialFighters({
      player: setup('pain', 500),
      allies: [setup('path', 200)],
      enemies: [],
      canFlee: true,
    });
    const body: PlanFighter = { ...path!, summoner: 'pain', ...pooledFrom(caller!) };
    expect(body.chakra).toBe(500);
    const spent: PlanFighter = { ...body, chakra: body.chakra - 60 };
    const round: Round = {
      number: 1,
      fighters: [caller!, spent],
      range: 'mid',
      story: [],
      seen: {},
      intents: {},
    };
    const after = pooledAfter(round);
    expect(after.fighters[0]!.chakra).toBe(440);
    expect(after.fighters[1]!.chakra).toBe(440);
  });
});
