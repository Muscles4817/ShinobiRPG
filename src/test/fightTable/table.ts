import { createVersus, versusRoster, type GameContext } from '@/game';
import { fightOut } from '@/test/gameFixtures';

/**
 * THE FIGHT TABLE
 *
 * Canon matchups between the pack's own people, fought out in versus (watched, so both sides
 * fight on their own judgement) over many seeds and both sides of the table, to read what the
 * numbers make of who beats whom. A report, not a test: it asserts nothing, so it can be run
 * before and after a retune and the two tables compared.
 */

export interface Matchup {
  /** Which question the row answers ("Cross-rank: genin against chūnin"). */
  readonly group: string;
  /** Roster ids (`person:kakashi`, `enemy:zabuza`). */
  readonly a: string;
  readonly b: string;
}

export interface MatchupResult {
  readonly matchup: Matchup;
  readonly aName: string;
  readonly bName: string;
  /** Each side's fighting power as a grade, as versus reads it. */
  readonly aGrade: string;
  readonly bGrade: string;
  /** Share of bouts the first fighter won (both seats, all seeds). */
  readonly aWins: number;
  readonly avgRounds: number;
}

interface Bout {
  readonly firstWon: boolean;
  readonly rounds: number;
}

/** One watched bout; `first` on the player's seat. */
function bout(ctx: GameContext, first: string, second: string, seed: number): Bout {
  const made = createVersus(ctx, { side: [first], foes: [second], seed, watch: true });
  if (!made.ok) throw new Error(`${first} against ${second}: ${made.error}`);
  const done = fightOut(made.value, ctx);
  const card = done.reports.findLast((r) => r.kind === 'fight');
  if (card?.kind !== 'fight') throw new Error(`${first} against ${second} never ended`);
  return { firstWon: card.result === 'victory', rounds: card.rounds };
}

/** A matchup over `seeds` seeds in each seat. */
export function fightMatchup(ctx: GameContext, matchup: Matchup, seeds: number): MatchupResult {
  const results: { aWon: boolean; rounds: number }[] = [];
  for (let seed = 1; seed <= seeds; seed++) {
    const ab = bout(ctx, matchup.a, matchup.b, seed);
    results.push({ aWon: ab.firstWon, rounds: ab.rounds });
    const ba = bout(ctx, matchup.b, matchup.a, seed + 1000);
    results.push({ aWon: !ba.firstWon, rounds: ba.rounds });
  }
  const roster = versusRoster(ctx);
  const nameOf = (id: string) => roster.find((f) => f.id === id)?.name ?? id;
  const gradeOf = (id: string) => roster.find((f) => f.id === id)?.grade ?? '?';
  const sum = (xs: readonly number[]) => xs.reduce((t, x) => t + x, 0);
  return {
    matchup,
    aName: nameOf(matchup.a),
    bName: nameOf(matchup.b),
    aGrade: gradeOf(matchup.a),
    bGrade: gradeOf(matchup.b),
    aWins: results.filter((r) => r.aWon).length / results.length,
    avgRounds: sum(results.map((r) => r.rounds)) / results.length,
  };
}
