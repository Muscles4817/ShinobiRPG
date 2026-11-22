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
  readonly attributes?: Partial<CombatantSetup['attributes']>;
  readonly techniques?: readonly CombatTechnique[];
}

/** A fighter no one plans for: a bout only watched (`ownPlan`). */
const planless = ({ ownPlan: _own, ...f }: PlanFighter): PlanFighter => f;

function closeRound({ attributes = {}, techniques = [bolt] }: Caster): Round {
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
    fighters: withCloseQuarters(fighters.map(planless)),
    range: 'close',
    story: [],
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
  it('a caster sure to lose the seals, with nothing signless to throw, steps back', () => {
    // Quick enough on their feet that the step back makes room.
    const round = closeRound({ attributes: { speed: 40 } });
    expect(crowdWary(round, caster(round), cast(round))).toMatchObject({
      card: { kind: 'step', direction: 'back' },
      why: 'crowded',
    });
  });

  it('casts anyway when the crowder would only follow a step back', () => {
    const round = closeRound({});
    expect(crowdWary(round, caster(round), cast(round))).toBeNull();
  });

  it('throws something signless instead when it beats the cast after its risk', () => {
    const round = closeRound({ attributes: { taijutsu: 25 }, techniques: [bolt, elbow] });
    expect(crowdWary(round, caster(round), cast(round))).toMatchObject({
      card: { kind: 'jutsu', technique: { id: 'elbow' } },
      target: { id: 'rusher' },
      why: 'crowded',
    });
  });

  it('casts anyway with a dull mind, or with the player’s own plan', () => {
    const dull = closeRound({ attributes: { intellect: 2 } });
    expect(crowdWary(dull, caster(dull), cast(dull))).toBeNull();
    const { watching: _watched, ...shown } = closeRound({});
    const own = (f: PlanFighter): PlanFighter => (f.isPlayer ? { ...f, ownPlan: true } : f);
    const playing = { ...shown, fighters: shown.fighters.map(own) };
    expect(crowdWary(playing, caster(playing), cast(playing))).toBeNull();
  });

  it('casts a strong attack whose worth carries its risk, even with something signless to hand', () => {
    const weak: CombatTechnique = { ...elbow, id: 'jab', effects: [{ verb: 'damage', power: 4 }] };
    const round = closeRound({
      attributes: { speed: 40, chakraControl: 30 },
      techniques: [bolt, weak],
    });
    expect(crowdWary(round, caster(round), cast(round))).toBeNull();
  });

  it('lays armour rather than step back while the seals more likely hold', () => {
    const shroud: CombatTechnique = {
      id: 'skin',
      name: 'Skin',
      discipline: 'ninjutsu',
      rank: 'C',
      effects: [{ verb: 'shroud', power: 10, kind: 'earth' }],
      chakraCost: 10,
    };
    const round = closeRound({
      attributes: { speed: 35, chakraControl: 25 },
      techniques: [shroud],
    });
    const armour = {
      card: { kind: 'jutsu' as const, technique: shroud },
      target: undefined,
      why: 'slot' as const,
    };
    expect(crowdWary(round, caster(round), armour)).toBeNull();
  });

  it('casts anyway when the seals are quick and sure enough', () => {
    const round = closeRound({ attributes: { speed: 50, chakraControl: 50 } });
    expect(crowdWary(round, caster(round), cast(round))).toBeNull();
  });
});
