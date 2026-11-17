import type { CombatantSetup, CombatTechnique } from '../../contract';
import { withCloseQuarters } from './closeQuarters';
import { crowdWary } from './crowding';
import { initialFighters, type PlanFighter, type Round } from './state';

/** Keeping the seals clear of a crowder (`crowding.ts`). */

const base: CombatantSetup['attributes'] = {
  strength: 15,
  speed: 10,
  stamina: 15,
  chakraControl: 10,
  intellect: 20,
  perception: 15,
  willpower: 15,
  taijutsu: 10,
  ninjutsu: 25,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'ninjutsu',
  rank: 'A',
  reach: ['close', 'mid', 'far'],
  effects: [{ verb: 'damage', power: 24 }],
  chakraCost: 20,
};
const elbow: CombatTechnique = {
  id: 'elbow',
  name: 'Elbow',
  discipline: 'taijutsu',
  rank: 'C',
  effects: [{ verb: 'damage', power: 20 }],
  chakraCost: 4,
};

interface Caster {
  readonly handSigns?: boolean;
  readonly attributes?: Partial<CombatantSetup['attributes']>;
  readonly techniques?: readonly CombatTechnique[];
}

function closeRound({ handSigns = true, attributes = {}, techniques = [bolt] }: Caster): Round {
  const setup = (id: string, extra: Partial<CombatantSetup>): CombatantSetup => ({
    id,
    name: id,
    attributes: base,
    health: 100,
    maxHealth: 100,
    chakra: 100,
    maxChakra: 100,
    techniques: [],
    ...extra,
  });
  const fighters = initialFighters({
    player: setup('caster', { attributes: { ...base, ...attributes }, techniques }),
    allies: [],
    enemies: [
      setup('rusher', {
        attributes: { ...base, speed: 35, taijutsu: 35, ninjutsu: 5 },
        techniques: [elbow],
      }),
    ],
    canFlee: false,
  });
  return {
    number: 1,
    fighters: withCloseQuarters(fighters, { experiments: { handSigns } }),
    range: 'close',
    lines: [],
    seen: {},
    intents: {},
    watching: true,
  };
}

const caster = (round: Round): PlanFighter => round.fighters.find((f) => f.id === 'caster')!;
const rusher = (round: Round): PlanFighter => round.fighters.find((f) => f.id === 'rusher')!;
const cast = (round: Round) => ({
  card: { kind: 'jutsu' as const, technique: bolt },
  target: rusher(round),
  why: 'slot' as const,
});

describe('keeping the seals clear of a crowder', () => {
  it('a caster strongest further off steps back rather than cast into the crowder', () => {
    const round = closeRound({});
    expect(crowdWary(round, caster(round), cast(round))).toMatchObject({
      card: { kind: 'step', direction: 'back' },
      why: 'crowded',
    });
  });

  it('one at home up close throws something that needs no signs instead', () => {
    const round = closeRound({ attributes: { taijutsu: 25 }, techniques: [bolt, elbow] });
    expect(crowdWary(round, caster(round), cast(round))).toMatchObject({
      card: { kind: 'jutsu', technique: { id: 'elbow' } },
      target: { id: 'rusher' },
      why: 'crowded',
    });
  });

  it('casts anyway with the rule off, with a dull mind, or with the player’s own plan', () => {
    const off = closeRound({ handSigns: false });
    expect(crowdWary(off, caster(off), cast(off))).toBeNull();
    const dull = closeRound({ attributes: { intellect: 2 } });
    expect(crowdWary(dull, caster(dull), cast(dull))).toBeNull();
    const { watching: _watched, ...playing } = closeRound({});
    expect(crowdWary(playing, caster(playing), cast(playing))).toBeNull();
  });

  it('casts anyway when the seals are quick and sure enough', () => {
    const round = closeRound({ attributes: { speed: 50, chakraControl: 50 } });
    expect(crowdWary(round, caster(round), cast(round))).toBeNull();
  });
});
