import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../../../contract';
import { createPlanEngine } from '../../engine';
import { decode, type PlanFighter, type PlanState } from '../../state';
import type { Objective } from '../shape';
import { candidatesFor } from './candidates';
import { TIERS } from './ladder';
import { proposalsFor } from './proposals';

/** What an objective proposes, and that its first proposal is the move to beat. */

const jab: CombatTechnique = {
  id: 'jab',
  name: 'Jab',
  discipline: 'ninjutsu',
  reach: ['close', 'mid', 'far'],
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 10,
};

function fighter(id: string): CombatantSetup {
  const v = 20;
  return {
    id,
    name: id,
    attributes: {
      strength: v,
      speed: v,
      stamina: v,
      chakraControl: v,
      intellect: v,
      perception: v,
      willpower: v,
      taijutsu: v,
      ninjutsu: v,
      genjutsu: v,
      kenjutsu: v,
      fuuinjutsu: v,
    },
    health: 100,
    maxHealth: 100,
    chakra: 10,
    maxChakra: 100,
    techniques: [jab],
  };
}

/** A fight at `range` with the foe holding `objective` (none when absent). */
function fight(
  range: 'close' | 'mid',
  objective?: Objective,
): { state: PlanState; foe: PlanFighter } {
  const start = createPlanEngine().start(
    {
      player: fighter('hero'),
      allies: [],
      enemies: [fighter('foe')],
      canFlee: false,
      watch: true,
      instinct: true,
    },
    createRng(1),
  );
  const plan = decode(start);
  const fighters = plan.fighters.map((f) =>
    f.id === 'foe' && objective ? { ...f, objective: { id: objective, since: 0 } } : f,
  );
  const state = { ...plan, range, fighters };
  return { state, foe: fighters.find((f) => f.id === 'foe')! };
}

describe('what an objective proposes', () => {
  it('recovering, a fighter gathers, and gets out of reach first when a foe is close', () => {
    const away = fight('mid', 'recover');
    expect(proposalsFor(away.state, away.foe)).toEqual(['gather']);
    const near = fight('close', 'recover');
    expect(proposalsFor(near.state, near.foe)).toEqual(['step-back', 'gather']);
  });

  it('surviving, a fighter is offered every way of playing for time', () => {
    const { state, foe } = fight('close', 'survive');
    expect(proposalsFor(state, foe)).toEqual(
      expect.arrayContaining(['evade', 'step-back', 'brace']),
    );
  });

  it('an objective not yet taken on proposes nothing', () => {
    const { state, foe } = fight('mid', 'wear-down');
    expect(proposalsFor(state, foe)).toEqual([]);
    const none = fight('mid');
    expect(proposalsFor(none.state, none.foe)).toEqual([]);
  });

  it('the first proposal it can play is the move to beat, and is scored', () => {
    const { state, foe } = fight('mid', 'recover');
    const { candidates, usual } = candidatesFor(state, foe, { tier: TIERS.C });
    expect(usual).toBe('gather');
    expect(candidates.some((c) => c.sequence.join(' ') === 'gather')).toBe(true);
  });

  it('a held plan’s next step still comes before a proposal', () => {
    const { state, foe } = fight('mid', 'recover');
    const { usual } = candidatesFor(state, foe, { tier: TIERS.C, keep: 'jutsu:jab' });
    expect(usual).toBe('jutsu:jab');
  });
});
