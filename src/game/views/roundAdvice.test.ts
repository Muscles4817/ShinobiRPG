import type { CombatView } from '@/systems/combat';

import { roundAdvice } from './roundAdvice';
import { roundWhy } from './roundWhy';

/** One thing to try next round, from what the rules prove (audit P1.3). */

const fighter = { health: 100, maxHealth: 100, chakra: 50, maxChakra: 50, statuses: [] };

function after(...lines: string[]): CombatView {
  return {
    round: 2,
    combatants: [
      { id: 'aoi', name: 'Aoi', side: 'player', ...fighter },
      { id: 'goro', name: 'Goro', side: 'enemy', ...fighter },
    ],
    options: [],
    log: ['— First exchange — ⟦rs⟧', ...lines],
  };
}

describe('round advice', () => {
  it('says nothing when nothing happened twice', () => {
    expect(roundAdvice(after('Aoi hits Goro. ⟦n:aoi|goro⟧ ⟦by:aoi⟧ ⟦-9⟧'))).toBeNull();
  });

  it('names what gets past a Guard they keep up', () => {
    const guarded = 'Aoi hits Goro. ⟦n:aoi|goro⟧ ⟦r:guarded⟧ ⟦by:aoi⟧ ⟦-3⟧';
    expect(roundAdvice(after(guarded, guarded))).toMatch(/guard-breaker or a flurry/);
  });

  it('a move they have read comes before their defence', () => {
    const read = 'Goro reads Aoi’s kick. ⟦n:goro|aoi⟧ ⟦r:missed⟧ ⟦c:familiar⟧ ⟦by:aoi⟧';
    const guarded = 'Aoi hits Goro. ⟦n:aoi|goro⟧ ⟦r:guarded⟧ ⟦by:aoi⟧ ⟦-3⟧';
    expect(roundAdvice(after(read, read, guarded, guarded))).toMatch(/Change it up/);
  });

  it('steps that keep failing say stay where you are', () => {
    const blocked = 'Goro cuts Aoi off. ⟦n:aoi|goro⟧ ⟦c:outpaced⟧ ⟦by:aoi⟧';
    expect(roundAdvice(after(blocked, blocked))).toMatch(/Fight from where you stand/);
  });
});

describe('the strip says why', () => {
  it('rows the causes of your misses, failed steps and holds that didn’t take', () => {
    const view = after(
      'Goro slips Aoi’s kick. ⟦n:goro|aoi⟧ ⟦r:missed⟧ ⟦c:read-it⟧ ⟦by:aoi⟧',
      'Goro cuts Aoi off. ⟦n:aoi|goro⟧ ⟦c:outpaced⟧ ⟦by:aoi⟧',
      'Goro shakes it off. ⟦n:goro⟧ ⟦c:resisted⟧ ⟦by:aoi⟧',
    );
    const rows = Object.fromEntries(
      roundWhy(view).map((r) => [r.text, r.chips.map((c) => c.label)]),
    );
    expect(rows['Why your attacks were slipped']).toEqual(['Read it coming ×1']);
    expect(rows['Why your steps failed']).toEqual(['Outpaced ×1']);
    expect(rows['Why your holds didn’t take']).toEqual(['Resisted ×1']);
  });
});
