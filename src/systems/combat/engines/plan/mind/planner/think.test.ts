import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../../../contract';
import { decisionsOf } from '../../decisionLog';
import { createPlanEngine } from '../../engine';
import { decode } from '../../state';
import { candidatesFor } from './candidates';
import { TIERS } from './ladder';

/** Foes who think ahead plan as a round begins and play their plan's steps (`think.ts`). */

const jab: CombatTechnique = {
  id: 'jab',
  name: 'Jab',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 0,
};
const stun: CombatTechnique = {
  id: 'stun',
  name: 'Stun',
  discipline: 'taijutsu',
  effects: [{ verb: 'daze', power: 12 }],
  chakraCost: 4,
};
const finisher: CombatTechnique = {
  id: 'finisher',
  name: 'Finisher',
  discipline: 'taijutsu',
  needsTarget: 'open',
  effects: [{ verb: 'damage', power: 40 }],
  chakraCost: 8,
};

function fighter(id: string, techniques: CombatTechnique[]): CombatantSetup {
  const v = 25;
  return {
    id,
    name: id,
    attributes: {
      strength: v,
      speed: v,
      stamina: v,
      chakraControl: v,
      intellect: 30,
      perception: v,
      willpower: v,
      taijutsu: v,
      ninjutsu: 10,
      genjutsu: 10,
      kenjutsu: 10,
      fuuinjutsu: 10,
    },
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques,
  };
}

function announced(planner: boolean, seed = 1) {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  const setup = {
    player: fighter('hero', [jab]),
    allies: [],
    enemies: [fighter('foe', [jab, stun, finisher])],
    canFlee: false,
    watch: true,
    trace: true,
    ...(planner ? { experiments: { planner: true } } : {}),
  };
  let state = engine.start(setup, rng);
  for (let n = 0; n < 8 && !engine.outcome(state); n++) {
    const next = engine.act(state, { optionId: 'next' }, rng);
    if (!next.ok) throw new Error(next.error);
    state = next.value;
  }
  return { state, decisions: decisionsOf(state).filter((d) => d.phase === 'announce') };
}

describe('foes who think ahead', () => {
  it('plan as each round begins, in a fight that tries it', () => {
    const thinking = announced(true).decisions;
    expect(thinking[0]?.why).toBe('planned');
    expect(
      announced(false).decisions.some((d) => d.why === 'planned' || d.why === 'plan-step'),
    ).toBe(false);
  });

  it('keep the plan they made on the fighter', () => {
    const foe = decode(announced(true).state).fighters.find((f) => f.id === 'foe');
    expect(foe?.thinks).toBe(true);
    expect(foe?.planned?.steps.length).toBeGreaterThan(0);
  });

  it('proposes the daze before the finisher, with nothing written for it', () => {
    const start = createPlanEngine().start(
      {
        player: fighter('hero', [jab]),
        allies: [],
        enemies: [fighter('foe', [jab, stun, finisher])],
        canFlee: false,
        watch: true,
      },
      createRng(1),
    );
    const state = { ...decode(start), range: 'close' as const };
    const foe = state.fighters.find((f) => f.id === 'foe')!;
    const { candidates } = candidatesFor(state, foe, TIERS.C);
    expect(candidates.map((c) => c.sequence.join(' '))).toContain('jutsu:stun jutsu:finisher');
  });
});
