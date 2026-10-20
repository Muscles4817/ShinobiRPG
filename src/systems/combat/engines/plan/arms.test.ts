import { createRng, type Rng } from '@/core';

import { hitsOn } from '@/test/fightLines';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import type { CombatGear, CombatWeapon } from '../../gearContract';
import { NEEDS_WEAPON } from '../../rules/weapons';
import { strike } from './arms';
import { fitsBand, strikeCard } from './cards';
import { defaultLoadout } from './defaults';
import { styleMoves } from './repertoire';
import { createPlanEngine } from './engine';
import { attackOf } from './rows';
import { improvise } from './stepping';
import { initialFighters, plainSlots, type PlanFighter, type Round } from './state';
import { cardLabel } from './wording';

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

/**
 * Every blow lands: the first roll (the target's avoid roll, which anyone makes) misses, and
 * every chance after it comes up.
 */
function landing(): Rng {
  let rolled = false;
  return {
    ...createRng(1),
    next: () => 0,
    chance: (p) => {
      if (rolled) return p > 0;
      rolled = true;
      return false;
    },
  };
}

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

const weapon = (
  weaponClass: CombatWeapon['weaponClass'],
  extra: Partial<CombatWeapon> = {},
): CombatWeapon => ({
  name: `A ${weaponClass}`,
  weaponClass,
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
  return strike(roundOf([hero, other]), { actor: hero, target: other, rng: landing() }, thrown);
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
    const bladed = tableOf({ held: weapon('sword') }).find(
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
    const [armed] = duel({ held: weapon('sword') });
    const loadout = defaultLoadout({ ...armed, techniques: [slash] });
    // With a blade in hand the slash is a form of the style, played through the strike.
    expect(loadout.close.map((s) => s.card)).toContain('strike');
    expect(styleMoves({ ...armed, techniques: [slash] }).map((t) => t.id)).toEqual(['slash']);
  });

  it('a held blade makes the plain strike a cut', () => {
    const [armed] = duel({ held: weapon('sword') });
    const [bare] = duel({});
    expect(cardLabel({ kind: 'strike' }, armed)).toBe('Cut');
    expect(cardLabel({ kind: 'strike' }, bare)).toBe('Strike');
    expect(hit({ held: weapon('sword') }).lines.join(' ')).toMatch(hitsOn('foe', "hero's cut"));
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
        { actor: hero, target: guarded, rng: landing() },
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
    const after = hit({ held: weapon('sword', { rank: 'A', effects: ['drain'] }) });
    const hero = after.fighters.find((f) => f.id === 'hero')!;
    expect(foeAfter(after).chakra).toBeLessThan(40);
    expect(hero.chakra).toBeGreaterThan(40);
    expect(after.lines.join(' ')).toContain('drinks');
  });

  it('armour takes the edge off a cut', () => {
    const plated = { gear: { armour: { name: 'Plate', level: 'plate', rank: 'D' } } } as const;
    const bare = 100 - foeAfter(hit({ held: weapon('sword') })).health;
    const armoured = 100 - foeAfter(hit({ held: weapon('sword') }, false, plated)).health;
    expect(armoured).toBeLessThan(bare);
  });

  it('a polearm or chain strikes at mid, where a swordsman steps in', () => {
    const [spear] = duel({ held: weapon('polearm') });
    const [sword] = duel({ held: weapon('sword') });
    expect(improvise(spear, 'mid')).toMatchObject({ kind: 'strike' });
    expect(improvise(sword, 'mid')).toEqual({ kind: 'step', direction: 'in' });
    expect(fitsBand(strikeCard(duel({ held: weapon('chain') })[0]), 'mid')).toBe(true);
    expect(fitsBand(strikeCard(spear), 'far')).toBe(false);
  });

  it('a spear reaches past the front row, as a kunai does', () => {
    const [spear] = duel({ held: weapon('polearm') });
    const [sword] = duel({ held: weapon('sword') });
    expect(attackOf(strikeCard(spear)).reach).toContain('mid');
    expect(attackOf(strikeCard(sword)).reach).toEqual(['close']);
  });

  it('twin blades strike as a flurry that a Guard meets only once', () => {
    const [, foe] = duel({});
    const guarded = { ...foe, loadout: { ...foe.loadout, close: plainSlots(['guard']) } };
    const cut = (held: CombatWeapon, seed: number) => {
      const [hero] = duel({ held });
      const after = strike(
        roundOf([hero, guarded]),
        { actor: hero, target: guarded, rng: createRng(seed) },
        false,
      );
      return 100 - foeAfter(after).health;
    };
    const seeds = Array.from({ length: 200 }, (_, i) => i + 1);
    const average = (held: CombatWeapon) =>
      seeds.reduce((sum, seed) => sum + cut(held, seed), 0) / seeds.length;
    expect(average(weapon('sword', { blades: 2 }))).toBeGreaterThan(average(weapon('sword')));
  });
});
