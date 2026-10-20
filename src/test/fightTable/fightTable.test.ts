import { contextForPack } from '@/game';

import { NARUTO_MATCHUPS } from './matchups';
import { fightMatchup, type MatchupResult } from './table';

/**
 * Runs the fight table and prints it as Markdown between two marker lines:
 * `VITE_FIGHT_TABLE=true npx vitest run src/test/fightTable --silent=false`. Skipped otherwise: it is a report
 * to read, not a check CI keeps.
 */

const RUN = import.meta.env.VITE_FIGHT_TABLE === 'true';
/** Seeds per seat; each matchup is fought twice this many times. */
const SEEDS = 15;
const TABLE_TIMEOUT_MS = 30 * 60_000;

function percent(share: number): string {
  return `${Math.round(share * 100)}%`;
}

function markdown(results: readonly MatchupResult[]): string {
  const lines = [
    '| Question | A | B | A wins | Avg rounds |',
    '| --- | --- | --- | --- | --- |',
    ...results.map(
      (r) =>
        `| ${r.matchup.group} | ${r.aName} (${r.aGrade}) | ${r.bName} (${r.bGrade}) | ${percent(r.aWins)} | ${r.avgRounds.toFixed(1)} |`,
    ),
  ];
  return `${lines.join('\n')}\n\n${SEEDS * 2} bouts a row, watched, on an open arena.\n`;
}

describe.runIf(RUN)('the fight table', () => {
  it(
    'fights every matchup and writes the table',
    () => {
      const ctx = contextForPack('naruto')!;
      const results = NARUTO_MATCHUPS.map((m) => fightMatchup(ctx, m, SEEDS));
      console.warn(`FIGHT TABLE\n${markdown(results)}END OF TABLE`);
      expect(results.length).toBe(NARUTO_MATCHUPS.length);
    },
    TABLE_TIMEOUT_MS,
  );
});
