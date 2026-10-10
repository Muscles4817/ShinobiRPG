import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique, CombatTrait } from '../../contract';
import { DISPEL_CHAKRA } from '../../rules/conditions';
import { defaultLoadout } from './cards';
import { chooseCard } from './choose';
import { createPlanEngine } from './engine';
import { rememberedLoadout } from './memory';
import { react, type Blow } from './react';
import { decide, resolveExchange } from './round';
import {
  decode,
  encode,
  initialFighters,
  type Loadout,
  type PlanFighter,
  type PlanState,
  type Round,
} from './state';

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 5,
  chakraControl: 5,
  intellect: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 5,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 50,
    maxHealth: 50,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

const blast: CombatTechnique = {
  id: 'blast',
  name: 'Blast',
  discipline: 'ninjutsu',
  effect: 'damage',
  chakraCost: 6,
  power: 16,
};

const NO_CARDS: Loadout = { close: [], mid: [], far: [] };
const STRIKE: Blow = { raw: 5, what: 'strike', dodgeable: true, physical: true, kind: 'blow' };

/** A hero and one enemy with the given traits. */
function pair(traits: CombatTrait[], hero: Partial<CombatantSetup> = {}): PlanFighter[] {
  return initialFighters({
    player: fighter('hero', hero),
    allies: [],
    enemies: [fighter('foe', { traits })],
    canFlee: true,
  });
}

function stateOf(fighters: PlanFighter[], range: PlanState['range'] = 'mid'): PlanState {
  return {
    phase: 'fight',
    round: 1,
    bout: 1,
    exchange: 0,
    fighters,
    range,
    seen: {},
    log: [],
    result: null,
    canFlee: true,
  };
}

/** The hero lands a blow on the defender up close. */
function hitOn(defender: PlanFighter, blow: Blow, seed = 1): Round {
  const [hero] = pair([]);
  const round: Round = {
    number: 1,
    fighters: [hero!, defender],
    range: 'close',
    lines: [],
    seen: {},
  };
  return react(round, { attacker: hero!, target: defender, blow, rng: createRng(seed) });
}

function damageTo(defender: PlanFighter, kind: 'blow' | 'jutsu'): number {
  const blow: Blow = { raw: 20, what: 'hit', dodgeable: true, physical: kind === 'blow', kind };
  return defender.health - (hitOn(defender, blow).fighters[1]?.health ?? 0);
}

describe('plan & watch kits: reach', () => {
  it('an archer never attacks up close and backs away instead', () => {
    const [, archer] = pair(['archer']);
    expect(defaultLoadout(archer!).close[0]).toBe('step-back');
    expect(defaultLoadout(archer!).close).not.toContain('strike');
    const slotted = { ...archer!, loadout: { ...NO_CARDS, close: ['strike', 'guard'] } };
    for (let seed = 1; seed <= 20; seed++) {
      const card = chooseCard(slotted, { band: 'close', foe: undefined }, createRng(seed));
      expect(card).toEqual({ kind: 'step', direction: 'back' });
    }
  });

  it('a brawler closes in instead of throwing from afar', () => {
    const [, brawler] = pair(['brawler']);
    expect(defaultLoadout(brawler!).far[0]).toBe('step-in');
    const slotted = { ...brawler!, loadout: { ...NO_CARDS, far: ['throw'] } };
    for (let seed = 1; seed <= 20; seed++) {
      const card = chooseCard(slotted, { band: 'far', foe: undefined }, createRng(seed));
      expect(card).toEqual({ kind: 'step', direction: 'in' });
    }
  });
});

describe('plan & watch kits: hits', () => {
  it('armour softens blows but not jutsu', () => {
    const [, plain] = pair([]);
    const [, armoured] = pair(['armoured']);
    expect(damageTo(armoured!, 'blow')).toBeLessThan(damageTo(plain!, 'blow'));
    expect(damageTo(armoured!, 'jutsu')).toBe(damageTo(plain!, 'jutsu'));
  });

  it('a badly hurt coward flees and counts as beaten', () => {
    const [, coward] = pair(['coward']);
    const after = hitOn({ ...coward!, health: 18 }, STRIKE);
    expect(after.fighters[1]?.health).toBe(0);
    expect(after.lines.at(-1)).toBe('foe flees!');
    expect(decide(after.fighters)).toBe('victory');
  });

  it('a swift fighter slips some blows even without Dodge', () => {
    const [, swift] = pair(['swift']);
    const [, plain] = pair([]);
    const slips = (f: PlanFighter) =>
      Array.from({ length: 40 }, (_, seed) => hitOn(f, STRIKE, seed)).filter((r) =>
        r.lines[0]?.includes('slips past'),
      ).length;
    expect(slips(swift!)).toBeGreaterThan(0);
    expect(slips(plain!)).toBe(0);
  });
});

describe('plan & watch kits: illusions', () => {
  it('a hidden foe cannot be attacked', () => {
    const [hero, ghost] = pair(['illusionist']);
    expect(ghost!.hidden).toBe(true);
    const armed = { ...hero!, loadout: { ...NO_CARDS, mid: ['throw'] } };
    const after = resolveExchange(stateOf([armed, ghost!]), createRng(3));
    expect(after.log).toContain("hero can't find a target.");
    expect(after.fighters[1]?.health).toBe(ghost!.health);
  });

  it('Search finds a hidden foe (insight always does)', () => {
    const [hero, ghost] = pair(['illusionist'], { perks: ['insight'] });
    const seeker = { ...hero!, loadout: { ...NO_CARDS, mid: ['search', 'throw'] } };
    const after = resolveExchange(stateOf([seeker, ghost!]), createRng(3));
    expect(after.log).toContain('hero spots foe!');
    expect(after.fighters[1]?.hidden).toBe(false);
  });

  it('Dispel spends chakra and clears your head', () => {
    const [hero, ghost] = pair(['illusionist']);
    const caster = { ...hero!, confused: 2, loadout: { ...NO_CARDS, mid: ['dispel'] } };
    const moment = { band: 'mid' as const, foe: undefined, hiddenFoe: true };
    expect(chooseCard(caster, moment, createRng(1))).toEqual({ kind: 'dispel' });
    // The illusionist is dazed this exchange, so it can't confuse the caster again.
    const dazedGhost = { ...ghost!, stunned: 1 };
    const after = resolveExchange(stateOf([caster, dazedGhost]), createRng(3));
    const player = after.fighters[0]!;
    expect(after.log).toContain('hero forms the seal to break illusions.');
    expect(player.chakra).toBe(30 - DISPEL_CHAKRA + 2);
    expect(player.confused).toBe(0);
  });

  it('confused attacks sometimes go wide', () => {
    const [hero, foe] = pair([]);
    const dazed = { ...hero!, confused: 2, loadout: { ...NO_CARDS, mid: ['throw'] } };
    const logs = Array.from({ length: 20 }, (_, seed) =>
      resolveExchange(stateOf([dazed, foe!]), createRng(seed)).log.join('\n'),
    );
    const wide = 'Your senses lie to you. The attack goes wide.';
    expect(logs.some((l) => l.includes(wide))).toBe(true);
  });

  it('the plan prompt says when someone is hidden', () => {
    const engine = createPlanEngine();
    const ghost = fighter('foe', { traits: ['illusionist'] });
    const state = engine.start(
      { player: fighter('hero'), allies: [], enemies: [ghost], canFlee: true },
      createRng(1),
    );
    const view = engine.view(state);
    expect(view.prompt).toMatch(/Search or Dispel/);
    expect(view.combatants.find((c) => c.id === 'foe')?.targetable).toBe(false);
  });
});

describe('plan & watch kits: saves', () => {
  it('remembers Search and Dispel in a loadout', () => {
    const [hero] = pair([], { techniques: [blast] });
    const plan = { close: ['search'], mid: ['dispel', 'jutsu:blast'], far: [] };
    expect(rememberedLoadout(plan, hero!)).toEqual(plan);
  });

  it('a fight saved before kits and tools still views and plays', () => {
    const fighters = pair([]).map(({ traits: _t, hidden: _h, confused: _c, items: _i, ...f }) => f);
    // An old save's fighters lack the kit fields; that is exactly what this test feeds in.
    const old = encode({ ...stateOf(fighters as PlanFighter[]), phase: 'loadout' });
    const engine = createPlanEngine();
    expect(engine.view(old).combatants).toHaveLength(2);
    const begun = engine.act(old, { optionId: 'begin' }, createRng(1));
    if (!begun.ok) throw new Error(begun.error);
    const next = engine.act(begun.value, { optionId: 'next' }, createRng(2));
    expect(next.ok).toBe(true);
    if (next.ok) expect(decode(next.value).fighters[0]?.traits).toEqual([]);
    if (next.ok) expect(decode(next.value).fighters[0]?.items).toEqual([]);
  });
});
