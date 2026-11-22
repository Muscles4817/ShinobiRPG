import { textOf } from '@/test/fightLines';
import type { TechniqueDef } from '@/systems/techniques';

import type { CombatantSetup } from '../../contract';
import { bracedAvoid, bracedFor, bracedShake, BRACED_MOST } from './braced';
import { heldBy, holdIllusion, illusionsAfter } from './illusions';
import { fighterIn, initialFighters, type PlanFighter, type Round } from './state';

/** Illusions are a contest of control: a braced mind shakes them off, and holding one costs. */

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
  genjutsu: 20,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const DREAD: TechniqueDef = {
  id: 'dread',
  name: 'Dread',
  description: 'A slow nightmare.',
  discipline: 'genjutsu',
  effects: [{ verb: 'confuse', power: 12 }],
  chakraCost: 0,
  rank: 'C',
  difficulty: 40,
};

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 100,
    maxChakra: 100,
    techniques: [DREAD],
    ...over,
  };
}

function round(enemies: readonly CombatantSetup[] = [setup('foe')]): Round {
  const fighters = initialFighters({ player: setup('caster'), allies: [], enemies, canFlee: true });
  return { number: 1, fighters, range: 'mid', story: [], seen: {}, intents: {} };
}

const who = (r: Round, id: string) => fighterIn(r, id)!;

function caught(r: Round, targetId = 'foe'): Round {
  const held = holdIllusion(r, { caster: who(r, 'caster'), targetId, technique: DREAD });
  return {
    ...held,
    fighters: held.fighters.map((f): PlanFighter =>
      f.id === targetId ? { ...f, confused: 2 } : f,
    ),
  };
}

describe('braced for an illusion', () => {
  it('expects one from a caster it has seen cast one, or while it keeps a Dispel', () => {
    const r = round();
    expect(bracedFor(r, who(r, 'foe'), who(r, 'caster'))).toBe(false);
    const seen = { ...r, seen: { caster: ['jutsu:dread'] } };
    expect(bracedFor(seen, who(seen, 'foe'), who(seen, 'caster'))).toBe(true);
  });

  it('shakes off more the finer its control against the caster’s art, never past the most', () => {
    const r = round();
    const foe = who(r, 'foe');
    const fine = { ...foe, attributes: { ...foe.attributes, chakraControl: 60 } };
    expect(bracedShake(fine, who(r, 'caster'))).toBeGreaterThan(bracedShake(foe, who(r, 'caster')));
    expect(bracedShake(fine, who(r, 'caster'))).toBeLessThanOrEqual(BRACED_MOST);
    const seen = { ...r, seen: { caster: ['jutsu:dread'] } };
    const odds = 0.2;
    expect(bracedAvoid(seen, { target: foe, caster: who(r, 'caster'), odds })).toBeGreaterThan(
      odds,
    );
    expect(bracedAvoid(r, { target: foe, caster: who(r, 'caster'), odds })).toBe(odds);
  });
});

describe('a held illusion', () => {
  it('costs its caster a share of the technique each exchange it holds', () => {
    const r = caught(round());
    const upkeep = heldBy(who(r, 'caster'), DREAD).upkeep;
    const after = illusionsAfter(r);
    expect(who(after, 'caster').chakra).toBe(100 - upkeep);
    expect(who(after, 'foe').confused).toBe(2);
  });

  it('lets go once its caster can’t pay', () => {
    const r = caught(round());
    const broke = {
      ...r,
      fighters: r.fighters.map((f): PlanFighter => (f.id === 'caster' ? { ...f, chakra: 0 } : f)),
    };
    const after = illusionsAfter(broke);
    expect(who(after, 'foe')).toMatchObject({ confused: 0 });
    expect(who(after, 'foe').illusion).toBeUndefined();
    expect(textOf(after.story).join(' ')).toMatch(/lets go/);
  });

  it('is shaken loose from one body of a shared mind by another', () => {
    const mind = { id: 'paths' };
    const r = caught(round([setup('foe', { mind }), setup('mate', { mind })]));
    const after = illusionsAfter(r);
    expect(who(after, 'foe').confused).toBe(0);
    expect(textOf(after.story).join(' ')).toMatch(/shakes foe out of the illusion/);
  });
});
