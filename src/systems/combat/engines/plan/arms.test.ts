import { createRng, type Rng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import type { CombatGear, CombatWeapon } from '../../gearContract';
import { NEEDS_WEAPON } from '../../rules/weapons';
import { strike } from './arms';
import { defaultLoadout } from './cards';
import { createPlanEngine } from './engine';
import { initialFighters, plainSlots, type PlanFighter, type Round } from './state';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 5,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const slash: CombatTechnique = {
  id: 'slash',
  name: 'Slash',
  discipline: 'kenjutsu',
  needs: { weapon: 'blade' },
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 4,
};

/** Every roll lands: nothing is dodged, every chance comes up. */
const sure: Rng = { ...createRng(1), next: () => 0, chance: (p) => p > 0 };

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 40,
    maxChakra: 60,
    techniques: [],
    ...overrides,
  };
}

const weapon = (shape: CombatWeapon['shape'], extra: Partial<CombatWeapon> = {}): CombatWeapon => ({
  name: `A ${shape}`,
  shape,
  rank: 'D',
  ...extra,
});

function duel(gear: CombatGear, foe: Partial<CombatantSetup> = {}): [PlanFighter, PlanFighter] {
  const [hero, other] = initialFighters({
    player: fighter('hero', { gear }),
    allies: [],
    enemies: [fighter('foe', foe)],
    canFlee: true,
  });
  return [hero!, other!];
}

function roundOf(fighters: PlanFighter[]): Round {
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

function hit(gear: CombatGear, thrown = false, foe: Partial<CombatantSetup> = {}): Round {
  const [hero, other] = duel(gear, foe);
  return strike(roundOf([hero, other]), { actor: hero, target: other, rng: sure }, thrown);
}

const foeAfter = (round: Round) => round.fighters.find((f) => f.id === 'foe')!;

function tableOf(gear: CombatGear) {
  const engine = createPlanEngine();
  const state = engine.start(
    {
      player: fighter('hero', { gear, techniques: [slash] }),
      allies: [],
      enemies: [fighter('foe')],
      canFlee: true,
      plan: { close: [], mid: [], far: [] },
    },
    createRng(1),
  );
  return engine.view(state).options;
}

describe('plan & watch weapons', () => {
  it('blade arts are blocked at the card table without a blade, and say why', () => {
    const bare = tableOf({}).find((o) => o.id === 'slot:close:jutsu:slash');
    expect(bare?.disabledReason).toBe(NEEDS_WEAPON.blade);
    const bladed = tableOf({ held: weapon('blade') }).find(
      (o) => o.id === 'slot:close:jutsu:slash',
    );
    expect(bladed?.disabledReason).toBeUndefined();
  });

  it('the default plan leaves blade arts out without a blade', () => {
    const [bare] = duel({});
    const unarmed = { ...bare, techniques: [slash] };
    expect(Object.values(defaultLoadout(unarmed)).flat()).not.toContainEqual({
      card: 'jutsu:slash',
    });
    const [armed] = duel({ held: weapon('blade') });
    const loadout = defaultLoadout({ ...armed, techniques: [slash] });
    expect(loadout.close.map((s) => s.card)).toContain('jutsu:slash');
  });

  it('a held blade makes the strike card a cut', () => {
    const labels = tableOf({ held: weapon('blade') }).map((o) => o.label);
    expect(labels).toContain('Cut');
    expect(tableOf({}).map((o) => o.label)).toContain('Strike');
    expect(hit({ held: weapon('blade') }).lines.join(' ')).toContain("hero's cut hits foe");
  });

  it('senbon land softer than kunai, and may daze', () => {
    const kunai = 100 - foeAfter(hit({}, true)).health;
    const needled = hit({ thrown: weapon('senbon') }, true);
    expect(100 - foeAfter(needled).health).toBeLessThan(kunai);
    expect(foeAfter(needled).stunned).toBe(1);
    expect(needled.lines.join(' ')).toContain('reels');
  });

  it('knuckles go partly through a guard', () => {
    const guarding = { techniques: [] };
    const [, foe] = duel({});
    const guarded = { ...foe, loadout: { ...foe.loadout, close: plainSlots(['guard']) } };
    const blow = (gear: CombatGear) => {
      const [hero] = duel(gear, guarding);
      const after = strike(
        roundOf([hero, guarded]),
        { actor: hero, target: guarded, rng: sure },
        false,
      );
      return 100 - foeAfter(after).health;
    };
    const ratio = blow({ held: weapon('knuckles') }) / blow({});
    const unguarded =
      (100 - foeAfter(hit({ held: weapon('knuckles') })).health) / (100 - foeAfter(hit({})).health);
    expect(ratio).toBeGreaterThan(unguarded);
  });

  it('a draining weapon drinks the chakra of whoever it cuts', () => {
    const after = hit({ held: weapon('blade', { rank: 'A', effects: ['drain'] }) });
    const hero = after.fighters.find((f) => f.id === 'hero')!;
    expect(foeAfter(after).chakra).toBeLessThan(40);
    expect(hero.chakra).toBeGreaterThan(40);
    expect(after.lines.join(' ')).toContain('drinks');
  });

  it('armour takes the edge off a cut', () => {
    const plated = { gear: { armour: { name: 'Plate', level: 'plate', rank: 'D' } } } as const;
    const bare = 100 - foeAfter(hit({ held: weapon('blade') })).health;
    const armoured = 100 - foeAfter(hit({ held: weapon('blade') }, false, plated)).health;
    expect(armoured).toBeLessThan(bare);
  });
});
