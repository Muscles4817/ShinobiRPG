import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { splitNarration } from '../../rules/narration';
import { createPlanEngine } from './engine';
import { step } from './steps';
import { initialFighters, type Round } from './state';

/** The screen says only what is true: who you can see, and whether anyone moved. */

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

const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'genjutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 4,
};

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...over,
  };
}

/** A hero against an illusionist, who starts hidden; the hero's eyes may see the hidden. */
function viewWith(perks: CombatantSetup['perks']) {
  const engine = createPlanEngine();
  const state = engine.start(
    {
      player: setup('hero', perks ? { perks } : {}),
      allies: [],
      enemies: [setup('foe', { traits: ['illusionist'], techniques: [bolt] })],
      canFlee: true,
    },
    createRng(1),
  );
  return engine.view(state);
}

describe('a hidden foe, as the player sees them', () => {
  it('is hidden and out of reach to ordinary eyes, with a Search to find them', () => {
    const view = viewWith(undefined);
    const foe = view.combatants.find((c) => c.id === 'foe')!;
    expect(foe.statuses).toContain('Hidden');
    expect(foe.targetable).toBe(false);
    expect(view.prompt).toMatch(/Search/);
  });

  it('stays hidden from eyes that only read foes (insight): they must find it', () => {
    const foe = viewWith(['insight']).combatants.find((c) => c.id === 'foe')!;
    expect(foe.statuses).toContain('Hidden');
    expect(foe.targetable).toBe(false);
  });

  it('is seen, and can be aimed at, by eyes that see everything', () => {
    const view = viewWith(['all-seeing']);
    const foe = view.combatants.find((c) => c.id === 'foe')!;
    expect(foe.statuses).toContain('Hidden, but you see them');
    expect(foe.statuses).not.toContain('Hidden');
    expect(foe.targetable).toBe(true);
    expect(view.prompt).not.toMatch(/Search/);
  });
});

describe('a step that can go no further', () => {
  it('is told as staying put, never as closing in', () => {
    const fighters = initialFighters({
      player: setup('hero'),
      allies: [],
      enemies: [setup('foe')],
      canFlee: true,
    });
    const round: Round = { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
    const hero = fighters.find((f) => f.id === 'hero')!;
    const after = step(round, { actor: hero, target: fighters[1], rng: createRng(1) }, 'in');
    expect(after.range).toBe('close');
    expect(after.lines.map((l) => splitNarration(l).text)).toEqual([
      'Hero presses in, but there is no closer to get.',
    ]);
  });
});
