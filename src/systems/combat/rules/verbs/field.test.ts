import type { CombatAttributes, CombatTechnique } from '../../contract';
import {
  blinds,
  covered,
  dulled,
  FIELD_RULES,
  fieldLeft,
  fieldMissChance,
  fieldPotency,
  moveGoal,
  raiseField,
  substitutable,
} from '.';

const attributes: CombatAttributes = {
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

const watcher = (side: 'player' | 'enemy', perception = 10, insight = false) => ({
  side,
  attributes: { ...attributes, perception },
  perks: insight ? (['insight'] as const) : [],
});

const mist = raiseField({ id: 'mist', side: 'player', potency: 12 }, 3);

describe('fields', () => {
  it('last their rule’s exchanges from the one they rise in, longer when strong', () => {
    expect(mist.until).toBe(3 + FIELD_RULES.mist.exchanges - 1);
    expect(fieldLeft(mist, 3)).toBe(FIELD_RULES.mist.exchanges);
    expect(fieldLeft(mist, mist.until + 1)).toBe(0);
    const strong = raiseField({ id: 'smoke', side: 'enemy', potency: 5, power: 12 }, 1);
    expect(strong.exchanges).toBe(FIELD_RULES.smoke.exchanges + 1);
  });

  it('are as dense as the art behind them', () => {
    const technique: CombatTechnique = {
      id: 'fog',
      name: 'Fog',
      discipline: 'ninjutsu',
      effects: [{ verb: 'field', field: 'mist', power: 10 }],
      chakraCost: 5,
    };
    const [effect] = technique.effects;
    if (effect?.verb !== 'field') throw new Error('fog raises a field');
    expect(fieldPotency(10, { technique, effect })).toBeGreaterThan(
      fieldPotency(5, { technique, effect }),
    );
  });

  it('blind the other side, unless their eyes are sharper than the field is thick', () => {
    expect(blinds(mist, watcher('player'))).toBe(false);
    expect(blinds(mist, watcher('enemy'))).toBe(true);
    expect(blinds(mist, watcher('enemy', 13))).toBe(false);
    expect(blinds(mist, watcher('enemy', 5, true))).toBe(false);
    expect(blinds(undefined, watcher('enemy'))).toBe(false);
  });

  it('dull a blinded fighter’s perception and send some of their attacks wide', () => {
    expect(dulled(mist, watcher('enemy')).attributes.perception).toBe(
      10 * FIELD_RULES.mist.perception,
    );
    expect(dulled(mist, watcher('player')).attributes.perception).toBe(10);
    expect(fieldMissChance(mist, watcher('enemy'))).toBe(FIELD_RULES.mist.miss);
    expect(fieldMissChance(mist, watcher('player'))).toBe(0);
  });

  it('mist covers its side’s blows on the blinded; smoke covers no one', () => {
    expect(covered(mist, watcher('player'), watcher('enemy'))).toBe(true);
    expect(covered(mist, watcher('enemy'), watcher('player'))).toBe(false);
    expect(covered(mist, watcher('player'), watcher('enemy', 20))).toBe(false);
    const smoke = raiseField({ id: 'smoke', side: 'player', potency: 12 }, 1);
    expect(covered(smoke, watcher('player'), watcher('enemy'))).toBe(false);
  });
});

describe('move and substitute', () => {
  const flicker = (to?: 'close' | 'far'): CombatTechnique => ({
    id: 'flicker',
    name: 'Flicker',
    discipline: 'ninjutsu',
    effects: [{ verb: 'move', power: 8, ...(to ? { to } : {}) }],
    chakraCost: 5,
  });

  it('a move goes where it says, else where its user fights best', () => {
    expect(moveGoal(flicker('far'), 'close')).toBe('far');
    expect(moveGoal(flicker(), 'close')).toBe('close');
    const punch = { ...flicker(), effects: [{ verb: 'damage' as const, power: 8 }] };
    expect(moveGoal(punch, 'close')).toBeNull();
  });

  it('a substitution swaps out of blows and ninjutsu, never an illusion', () => {
    expect(substitutable(undefined)).toBe(true);
    expect(substitutable('ninjutsu')).toBe(true);
    expect(substitutable('taijutsu')).toBe(true);
    expect(substitutable('genjutsu')).toBe(false);
  });
});
