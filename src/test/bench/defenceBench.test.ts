import { plainAtGrade } from './archetypes';
import type { FighterSpec } from './fighters';
import { bench, summarise, STALEMATE_EXCHANGES, type BenchReport } from './runner';

/**
 * THE DEFENCE BENCH (`docs/design/defence-plan.md`, Part 5)
 *
 * Committed defence buys time and never wins on its own: a fighter who only Evades (or only
 * Braces) against an equal who attacks loses most fights, but more slowly than one who trades
 * blows, and breath runs out, so no fight stalls. Set VITE_BENCH_REPORT=true to print the
 * measurements.
 */

/** A turtle wins at most this share against an equal who attacks. */
const TURTLE_WIN_RATE = 0.35;
/** A turtle's fights last at least this much longer than a trade between equals. */
const TURTLE_LASTS = 1.2;
const SEEDS = 60;

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';

/** A plain fighter at grade C who only commits to one defence, everywhere. */
function turtle(kind: 'evade' | 'brace'): FighterSpec {
  const plan = { close: [kind], mid: [kind], far: [kind] };
  return { ...plainAtGrade('C'), name: `Turtle (${kind})`, plan };
}

function measured(player: FighterSpec): BenchReport {
  const opponent = plainAtGrade('C');
  const report = bench(player, opponent, SEEDS);
  if (REPORT) console.warn(summarise(player, opponent, report));
  return report;
}

describe('committed defence buys time, never the fight', () => {
  const trading = measured(plainAtGrade('C'));

  it.each(['evade', 'brace'] as const)(
    'a fighter who only %ss loses to an equal, slowly',
    (kind) => {
      const report = measured(turtle(kind));
      expect(report.winRate).toBeLessThanOrEqual(TURTLE_WIN_RATE);
      expect(report.avgExchanges).toBeGreaterThanOrEqual(trading.avgExchanges * TURTLE_LASTS);
      expect(report.stalemateRate).toBe(0);
      expect(report.avgExchanges).toBeLessThan(STALEMATE_EXCHANGES);
    },
  );
});
