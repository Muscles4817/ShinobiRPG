import type { Reactions, PlanState } from '@/systems/combat/engines/plan/state';

import { plan } from './beam';
import { fightWith } from './fight';
import { duel, fighter, sling } from './scenarios';

/**
 * Experiment 1: a Dodge leaps clear (`src/systems/combat/engines/plan/leap.ts`). Does the
 * planner, with nothing written for it, find that a blow up close makes a dodger hand over mid,
 * where its Stone Sling is strong? Controls: the same foe keeping a Guard, and the same run on
 * the rules without the leap (run this file on a checkout without `leap.ts`).
 */

function start(ready: 'dodge' | 'guard'): PlanState {
  const s = duel(
    fighter('me', [sling], { stats: { taijutsu: 10, ninjutsu: 30 } }),
    fighter('foe', [], { stats: { taijutsu: 26, speed: 24, perception: 40 } }),
  );
  const reactions: Reactions = { close: ready, mid: ready, far: ready };
  // The rule is now a versus rule on trial (#303): this experiment turns it on for everyone,
  // unless LEAP_OFF is set for the control run.
  const leaps = process.env.LEAP_OFF ? {} : { leapsClear: true as const };
  return {
    ...s,
    fighters: s.fighters.map((f) =>
      f.isPlayer ? { ...f, ...leaps } : { ...f, reactions, ...leaps },
    ),
  };
}

const top = (p: ReturnType<typeof plan>) =>
  p.ranked
    .slice(0, 5)
    .map((r) => `${r.sequence.join(' > ')} (${r.value.toFixed(1)})`)
    .join(' | ');

describe('experiment 1: exploiting a Dodge that leaps clear', () => {
  for (const ready of ['dodge', 'guard'] as const) {
    it(`foe keeps ${ready} ready`, () => {
      const deep = plan(start(ready), 'me', { depth: 2, width: 5, rollouts: 80, ownHurt: 1 });
      console.log(`LEAP ${ready} ranking: ${top(deep)}`);
      const fights = Number(process.env.FIGHTS ?? 20);
      let won = 0,
        taken = 0,
        dealt = 0;
      const first = new Map<string, number>();
      for (let seed = 1; seed <= fights; seed++) {
        const r = fightWith(start(ready), 'me', {
          seed,
          cap: 30,
          search: { depth: 2, width: 4, rollouts: 24, ownHurt: 1 },
        });
        won += r.won ? 1 : 0;
        taken += r.taken;
        dealt += r.dealt;
        const k = r.chose[0]!;
        first.set(k, (first.get(k) ?? 0) + 1);
      }
      let dWon = 0;
      for (let seed = 1; seed <= fights; seed++)
        dWon += fightWith(start(ready), 'me', { seed, cap: 30 }).won ? 1 : 0;
      console.log(
        `LEAP ${ready} closed loop: planner won ${won}/${fights} (dealt ${(dealt / fights).toFixed(0)}, taken ${(taken / fights).toFixed(0)}), default plan won ${dWon}/${fights}; first moves ${JSON.stringify([...first])}`,
      );
    });
  }
});
