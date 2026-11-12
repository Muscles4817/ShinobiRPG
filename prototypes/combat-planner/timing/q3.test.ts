import type { CastId } from '@/test/bench/matrixCast';

import { benchDuel, daze, hide } from '../perf/states';
import { runCell, line, type CellRow } from './cell';
import { cast, save } from './fixtures';
import type { Controller } from './loop';
import { GRADES, LADDER, LADDER_V2, LADDER_V3, PERF_GOAP, type MindParams } from './mind';

/**
 * Q3: one planner, scaled by intellect and expertise. Stats never change between tiers: only the
 * planner's parameters (`LADDER`), so a difference in outcome is the mind's alone.
 * `Q3=vsAI|vsTier|combos`, `EXPERTISE=0|1`.
 */

const expertise = process.env.EXPERTISE !== '0';
const tag = `${process.env.Q3 ?? 'vsAI'}-x${expertise ? 1 : 0}${process.env.LADDER ? `-${process.env.LADDER}` : ''}${process.env.TAG ?? ''}`;
const SEEDS = Number(process.env.SEEDS ?? 5);

/** `LADDER=v2` runs ladder v2 (`between` decides the policy); the default is ladder v1. */
const TIERS =
  process.env.LADDER === 'v3' ? LADDER_V3 : process.env.LADDER === 'v2' ? LADDER_V2 : LADDER;
/** `Q3_TIERS=B|A`: only those tiers (the rest of a ladder unchanged needs no re-run). */
const ONLY = process.env.Q3_TIERS?.split('|');

/** A mind's controller: round plan; past its first step, kept (reactive checks) or re-scored warm. */
const mind = (id: string, params: MindParams): Controller =>
  params.between === 'warm'
    ? { id, policy: 'exchange', params, expertise, warm: true }
    : { id, policy: 'round', params, expertise, onInvalid: 'replan' };
const engineAI = (id: string): Controller => ({ id, policy: 'default' });

const MIRRORS: readonly CastId[] = [
  'rusher',
  'versatile',
  'assassin',
  'illusionist',
  'counterer',
  'areaCaster',
];
const TIER_MIRRORS: readonly CastId[] = ['rusher', 'versatile', 'assassin', 'illusionist'];

type Row = CellRow & { readonly tier: string; readonly side: string; readonly build: string };

it(`Q3 ${tag}`, () => {
  const rows: Row[] = [];
  const which = process.env.Q3 ?? 'vsAI';
  const tiers: [string, MindParams | null][] = [
    ['engine AI', null],
    ...GRADES.map((g): [string, MindParams] => [g, TIERS[g]]),
    ['perf GOAP r8', PERF_GOAP],
  ];
  if (which === 'vsAI') {
    for (const [tier, params] of tiers.filter(([t]) => !ONLY || ONLY.includes(t))) {
      for (const build of MIRRORS) {
        for (const side of ['player', 'foe'] as const) {
          if (!params && side === 'foe') continue; // engine AI on both sides: one baseline
          const row = runCell({
            label: `${tier} as ${side} · ${build} mirror`,
            make: () => benchDuel(cast(build), cast(build)),
            controllers: () =>
              side === 'player'
                ? [params ? mind('player', params) : engineAI('player'), engineAI('foe')]
                : [engineAI('player'), mind('foe', params!)],
            seeds: SEEDS,
            cap: 16,
            focus: side,
          });
          console.log(line(row));
          rows.push({ ...row, tier, side, build });
        }
      }
    }
  } else if (which === 'vsTier') {
    for (const g of GRADES.filter((x) => !ONLY || ONLY.includes(x))) {
      for (const build of TIER_MIRRORS) {
        for (const side of ['player', 'foe'] as const) {
          const other = side === 'player' ? 'foe' : 'player';
          const row = runCell({
            label: `${g} as ${side} vs C · ${build} mirror`,
            make: () => benchDuel(cast(build), cast(build)),
            controllers: () => [mind(side, TIERS[g]), mind(other, TIERS.C)],
            seeds: SEEDS,
            cap: 16,
            focus: side,
          });
          console.log(line(row));
          rows.push({ ...row, tier: g, side, build });
        }
      }
    }
    // The extremes head to head.
    for (const [a, b] of [
      ['E', 'S'],
      ['S', 'E'],
      ['D', 'B'],
      ['B', 'D'],
    ] as const) {
      for (const build of TIER_MIRRORS) {
        const row = runCell({
          label: `${a} (player) vs ${b} (foe) · ${build} mirror`,
          make: () => benchDuel(cast(build), cast(build)),
          controllers: () => [mind('player', TIERS[a]), mind('foe', TIERS[b])],
          seeds: SEEDS,
          cap: 16,
          focus: 'player',
        });
        console.log(line(row));
        rows.push({ ...row, tier: `${a}v${b}`, side: 'player', build });
      }
    }
  } else {
    for (const [tier, params] of tiers) {
      for (const [name, make, focus, seeds, cap] of [
        ['daze-finish', daze, 'me', 20, 8],
        ['hide-lethal', hide, 'me', 20, 8],
        ['assassin-v-sensor', () => benchDuel(cast('assassin'), cast('sensor')), 'player', 12, 16],
      ] as const) {
        const row = runCell({
          label: `${tier} · ${name}`,
          make,
          controllers: () => [params ? mind(focus, params) : engineAI(focus)],
          seeds,
          cap,
          focus,
        });
        console.log(line(row));
        rows.push({ ...row, tier, side: 'player', build: name });
      }
    }
  }
  save(`q3-${tag}`, rows);
});
