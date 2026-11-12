import { statTier } from '@/systems/stats';
import type { CastId } from '@/test/bench/matrixCast';

import { runCell, line, type CellRow } from './cell';
import { cast, idsOf, save, teamFight } from './fixtures';
import type { Controller } from './loop';
import { LADDER_V3, PERF_GOAP, type MindParams } from './mind';

/**
 * Q4: the combined planning cost when every fighter plans, 1v1 to 3v3, per round and per
 * exchange, by tier mix. Run it ALONE for timing (`Q4_SEEDS`, `Q4_CAP`).
 */

const LINEUPS: readonly { name: string; mine: readonly CastId[]; theirs: readonly CastId[] }[] = [
  {
    name: 'A',
    mine: ['rusher', 'versatile', 'stalker'],
    theirs: ['powerhouse', 'illusionist', 'mistBlade'],
  },
  {
    name: 'B',
    mine: ['assassin', 'medic', 'areaCaster'],
    theirs: ['counterer', 'sealer', 'trapper'],
  },
];

/** A controller as ladder v3 runs it: round plan, then kept or re-scored warm. */
const byLadder = (id: string, params: MindParams): Controller =>
  params.between === 'warm'
    ? { id, policy: 'exchange', params, warm: true }
    : { id, policy: 'round', params, onInvalid: 'replan' };

type Mix = { name: string; c: (id: string, intellect: number) => Controller };
const MIXES: readonly Mix[] = [
  { name: 'v3, own intellect grade', c: (id, i) => byLadder(id, LADDER_V3[statTier(i).grade]) },
  { name: 'v3, all C', c: (id) => byLadder(id, LADDER_V3.C) },
  { name: 'v3, all A', c: (id) => byLadder(id, LADDER_V3.A) },
  { name: 'v3, all S', c: (id) => byLadder(id, LADDER_V3.S) },
  {
    name: 'GOAP r8, round + reactive',
    c: (id) => ({ id, policy: 'round', params: PERF_GOAP, onInvalid: 'replan' }),
  },
  { name: 'GOAP r8, every exchange', c: (id) => ({ id, policy: 'exchange', params: PERF_GOAP }) },
];

const SEEDS = Number(process.env.Q4_SEEDS ?? 4);
const CAP = Number(process.env.Q4_CAP ?? 12);

it('Q4: combined cost, every fighter planning', () => {
  const rows: (CellRow & { lineup: string; size: number; mix: string; grades: string })[] = [];
  const mixes = process.env.Q4_MIXES?.split('|');
  const sizes = (process.env.Q4_SIZES ?? '1|2|3').split('|').map(Number);
  for (const lineup of LINEUPS) {
    for (const size of sizes) {
      const make = () =>
        teamFight(
          lineup.mine.slice(0, size).map((id) => cast(id)),
          lineup.theirs.slice(0, size).map((id) => cast(id)),
        );
      const s0 = make();
      const ids = [...idsOf(s0).player, ...idsOf(s0).enemy];
      const grades = s0.fighters.map((f) => statTier(f.attributes.intellect).grade).join('');
      for (const mix of MIXES.filter((m) => !mixes || mixes.includes(m.name))) {
        {
          const controllers = (): Controller[] =>
            ids.map((id) => mix.c(id, s0.fighters.find((x) => x.id === id)!.attributes.intellect));
          const row = runCell({
            label: `${lineup.name} ${size}v${size} · ${mix.name}`,
            make,
            controllers,
            seeds: SEEDS,
            cap: CAP,
            focus: 'player',
          });
          console.log(
            line(row),
            `| ALL ms/round ${row.allMsPerRound.toFixed(0)} p95 ${row.allMsPerRoundP95.toFixed(0)} ex/round ${row.allExPerRound.toFixed(0)} start ${row.allMsStartPerRound.toFixed(0)} gap p50 ${row.allMidGapP50.toFixed(0)} p95 ${row.allMidGapP95.toFixed(0)} | grades ${grades}`,
          );
          rows.push({ ...row, lineup: lineup.name, size, mix: mix.name, grades });
        }
      }
    }
  }
  save(`q4-${process.env.TAG ?? 'all'}`, rows);
});
