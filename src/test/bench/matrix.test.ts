import { benchSkirmish, type BenchReport } from './runner';
import { CAST_IDS, castMember, type CastId } from './matrixCast';
import { KNOWN_OUTLIERS } from './matrixOutliers';

/**
 * The archetype matrix (audit P0.3): every way of fighting in the cast against every other at
 * an equal grade (chūnin), both sides fighting by their own judgement (a watched fight), so the
 * matrix measures the builds and not the player's default plan. Each pair's win rate should sit
 * inside a loose band; pairs known to fall outside it today are listed, to be brought in by
 * tuning (P4.1), never by widening the band.
 *
 * CI runs `MATRIX_SEEDS` per pair. Set VITE_BENCH_REPORT=true (with `--silent=false`) to run
 * `REPORT_SEEDS` and print the table.
 */

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';
export const MATRIX_SEEDS = 8;
export const REPORT_SEEDS = 100;
/** No pair should be won less often than this, or more, at an equal grade. */
export const MATRIX_LOW = 0.15;
export const MATRIX_HIGH = 0.85;

const SEEDS = REPORT ? REPORT_SEEDS : MATRIX_SEEDS;

interface Cell {
  readonly a: CastId;
  readonly b: CastId;
  readonly report: BenchReport;
}

function cell(a: CastId, b: CastId): Cell {
  const report = benchSkirmish(
    { player: castMember(a, 'chunin'), allies: [], foes: [castMember(b, 'chunin')], watch: true },
    SEEDS,
  );
  return { a, b, report };
}

function table(cells: readonly Cell[]): string {
  const pct = (n: number) => String(Math.round(n * 100)).padStart(4);
  const head = `${''.padEnd(14)}${CAST_IDS.map((id) => id.slice(0, 4).padStart(5)).join('')}  all  exch  hp`;
  const rows = CAST_IDS.map((a) => {
    const mine = cells.filter((c) => c.a === a);
    const at = (b: CastId) => mine.find((c) => c.b === b)?.report;
    const cols = CAST_IDS.map((b) => (a === b ? '    -' : ` ${pct(at(b)?.winRate ?? 0)}`));
    const mean = (f: (r: BenchReport) => number) =>
      mine.reduce((sum, c) => sum + f(c.report), 0) / Math.max(1, mine.length);
    const tail = `${pct(mean((r) => r.winRate))} ${mean((r) => r.avgExchanges)
      .toFixed(1)
      .padStart(5)} ${pct(mean((r) => r.avgHealthLeft))}`;
    return `${a.padEnd(14)}${cols.join('')} ${tail}`;
  });
  return [head, ...rows].join('\n');
}

describe('the archetype matrix', () => {
  const cells = CAST_IDS.flatMap((a) => CAST_IDS.filter((b) => b !== a).map((b) => cell(a, b)));

  it('reports', () => {
    if (REPORT)
      console.warn(`Matrix, chūnin, ${SEEDS} seeds a pair (row's win %)\n${table(cells)}`);
    expect(cells.length).toBe(CAST_IDS.length * (CAST_IDS.length - 1));
  });

  it('keeps every pair inside the band, but for the known outliers', () => {
    const outside = cells
      .filter((c) => c.report.winRate < MATRIX_LOW || c.report.winRate > MATRIX_HIGH)
      .map((c) => `${c.a}>${c.b}`);
    if (REPORT) console.warn(`Outside the band: ${JSON.stringify(outside)}`);
    expect(outside.filter((p) => !KNOWN_OUTLIERS.includes(p))).toEqual([]);
  });
});
