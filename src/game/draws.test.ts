import { bornMedian } from '@/systems/stats';
import { ctx, newGame } from '@/test/gameFixtures';

import { bornFor } from './born';
import { glanceOdds, retinueSeen } from './retinueSight';
import { weekPlan } from './sensei/plan';

/**
 * Draws taken side by side are independent (`drawUnit`): the two draws of a stat at birth, the
 * days an irregular sensei meets you, each body of a retinue a glance may catch. With keys that
 * differ only at the end, `hashUnit` gave nearly the same value for each.
 */

const SEEDS = 4000;

describe('draws taken side by side', () => {
  it('give birth stats a normal spread: about one in twenty beyond two deviations', () => {
    const median = bornMedian('female').intellect;
    const logs = Array.from({ length: SEEDS }, (_, seed) =>
      Math.log(bornFor(seed + 1, 'female').intellect / median),
    );
    const mean = logs.reduce((a, b) => a + b, 0) / SEEDS;
    const sd = Math.sqrt(logs.reduce((a, b) => a + (b - mean) ** 2, 0) / SEEDS);
    const tails = logs.filter((x) => Math.abs(x - mean) > 2 * sd).length / SEEDS;
    // A normal curve puts 4.6% past two deviations; correlated draws put 6% there.
    expect(tails).toBeGreaterThan(0.038);
    expect(tails).toBeLessThan(0.052);
  });

  it('let an irregular sensei meet on nearly every pair of days a week holds', () => {
    const yomi = ctx.content.people.require('yomi');
    const game = newGame();
    const patterns = new Set(
      Array.from({ length: 400 }, (_, week) =>
        weekPlan(game, yomi, week + 1)
          .map((m) => m.day % 7)
          .join(','),
      ),
    );
    const count = weekPlan(game, yomi, 1).length;
    const possible = [1, 7, 21, 35, 35, 21, 7, 1][count] ?? 1;
    expect(patterns.size).toBeGreaterThan(possible * 0.8);
  });

  it('let a glance catch one hidden body of a retinue and miss another', () => {
    const [first, second] = ctx.content.enemies.all;
    const perception = Array.from({ length: 61 }, (_, p) => p).reduce((best, p) =>
      Math.abs(glanceOdds('hidden', p) - 0.5) < Math.abs(glanceOdds('hidden', best) - 0.5)
        ? p
        : best,
    );
    const def = {
      ...first!,
      retinue: [
        { enemyId: second!.id, tell: 'hidden' as const },
        { enemyId: second!.id, tell: 'hidden' as const },
      ],
    };
    const game = newGame();
    const looker = {
      ...game,
      character: { ...game.character, stats: { ...game.character.stats, perception } },
    };
    const split = Array.from({ length: 1000 }, (_, seed) => {
      const state = { ...looker, board: { ...looker.board, seed: seed + 1 } };
      return retinueSeen(state, def, 'glance').length === 1;
    }).filter(Boolean).length;
    // Two fair coins land differently half the time; correlated ones almost never.
    expect(split).toBeGreaterThan(350);
  });
});
