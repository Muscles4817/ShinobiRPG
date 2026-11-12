import type { PlanState, Reactions } from '@/systems/combat/engines/plan/state';

import { duel, fighter, sling } from '../scenarios';
import { goapPlanner } from './planners';

/** Does the recommended planner (GOAP candidates, r8, silent not needed) still find the Dodge-leap exploit? */
function start(ready: 'dodge' | 'guard'): PlanState {
  const s = duel(
    fighter('me', [sling], { stats: { taijutsu: 10, ninjutsu: 30 } }),
    fighter('foe', [], { stats: { taijutsu: 26, speed: 24, perception: 40 } }),
  );
  const reactions: Reactions = { close: ready, mid: ready, far: ready };
  return { ...s, fighters: s.fighters.map((f) => (f.isPlayer ? f : { ...f, reactions })) };
}

it('GOAP planner on the leap scenario', () => {
  for (const ready of ['dodge', 'guard'] as const) {
    for (const rollouts of [8, 32]) {
      const d = goapPlanner({ rollouts, widthOne: false })(start(ready), 'me');
      console.log(`GOAPLEAP ${ready} r${rollouts}: ${JSON.stringify(d)}`.slice(0, 300));
    }
  }
});
