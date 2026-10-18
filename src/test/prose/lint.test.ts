import { contextForPack } from '@/game';

import { PROSE_BUDGET } from './budget';
import { slipsIn, SLIPS } from './hygiene';
import { proseIn, styleOf, STYLE_HABITS } from './style';

/**
 * The prose lint, a ratchet: the numbers in `budget.ts` are where the prose stands, and a
 * change may only make them better. A pass that improves them lowers the budget to match, so
 * the gain can't quietly be spent again. Goldens are read as committed; a stale golden fails
 * in its own test.
 */

const GOLDENS: Readonly<Record<string, string>> = import.meta.glob('./goldens/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function goldens(): string {
  return Object.keys(GOLDENS)
    .sort()
    .map((path) => GOLDENS[path] ?? '')
    .join('\n');
}

/** Higher is worse: a count or a share of the text. */
function holds(name: string, actual: number, budget: number): void {
  expect(actual, `${name} rose above its budget`).toBeLessThanOrEqual(budget);
}

describe('the prose lint', () => {
  it('keeps the slips in the goldens within budget', () => {
    const slips = slipsIn(goldens());
    for (const slip of SLIPS) holds(slip, slips[slip], PROSE_BUDGET.slips[slip]);
  });

  it.each(['original', 'naruto'] as const)('keeps the %s pack’s style within budget', (pack) => {
    const ctx = contextForPack(pack);
    if (!ctx) return;
    const report = styleOf(proseIn(ctx.content));
    const budget = PROSE_BUDGET.style[pack];
    expect(report.meanSentence, 'sentences got shorter').toBeGreaterThanOrEqual(
      budget.meanSentence,
    );
    holds('short sentences', report.shortShare * 100, budget.shortShare * 100);
    holds('quips', report.quipShare * 100, budget.quipShare * 100);
    for (const habit of STYLE_HABITS) holds(habit, report.per1k[habit], budget.per1k[habit]);
  });
});
