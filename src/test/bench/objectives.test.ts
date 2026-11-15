import { vi } from 'vitest';

import type * as Aims from '@/systems/combat/engines/plan/mind/aims';
import { OBJECTIVES } from '@/systems/combat/engines/plan/mind';

import { castMember, CAST_IDS, type CastId } from './matrixCast';
import { emptyTally, shadowFight, tallyShadow, type ShadowTally } from './objectives';
import { tracedSkirmish } from './runner';

/**
 * The objective layer runs in shadow (`engines/plan/mind/objectives.ts`): every fighter holds an
 * objective, it is logged beside each move, and no move changes for it. Read against today's
 * AI, the bench says how often a move served the objective held, how long objectives are held,
 * and what each kind of fighter holds. Set `VITE_BENCH_REPORT=true` to print the whole cast.
 */

const aims = vi.hoisted(() => ({ off: false }));

vi.mock('@/systems/combat/engines/plan/mind/aims', async (original) => {
  const real = await original<typeof Aims>();
  return {
    ...real,
    objectivesAfter: (round: Parameters<typeof real.objectivesAfter>[0]) =>
      aims.off ? round : real.objectivesAfter(round),
  };
});

const PAIRS: readonly (readonly [CastId, CastId])[] = [
  ['rusher', 'illusionist'],
  ['stalker', 'mistBlade'],
  ['gates', 'summoner'],
  ['medic', 'assassin'],
];

function tallyOver(cast: readonly CastId[], seeds: number): ShadowTally {
  let tally = emptyTally();
  for (const a of cast) {
    for (const b of cast) {
      for (let seed = 1; seed <= seeds; seed++) tally = tallyShadow(tally, shadowFight(a, b, seed));
    }
  }
  return tally;
}

describe('objectives in shadow', () => {
  it.each(PAIRS)('%s against %s decides the same with no objectives held', (a, b) => {
    for (let seed = 1; seed <= 6; seed++) {
      const skirmish = {
        player: castMember(a, 'chunin'),
        allies: [],
        foes: [castMember(b, 'chunin')],
        watch: true,
      };
      aims.off = true;
      const without = tracedSkirmish(skirmish, seed);
      aims.off = false;
      const shadowed = tracedSkirmish(skirmish, seed);
      const bare = shadowed.decisions.map(({ objective: _o, ...d }) => d);
      expect({ ...shadowed, decisions: bare }).toEqual(without);
      expect(shadowed.decisions.every((d) => d.objective !== undefined)).toBe(true);
    }
  });

  it('holds objectives for more than an exchange at a time', () => {
    const tally = tallyOver(['rusher', 'illusionist', 'medic', 'gates'], 2);
    expect(tally.runTurns / tally.runs).toBeGreaterThan(2);
  });

  it.runIf(import.meta.env.VITE_BENCH_REPORT === 'true')(
    'prints the shadow over the whole cast',
    () => {
      const tally = tallyOver(CAST_IDS, 2);
      console.warn(
        `${tally.runTurns} turns, held ${(tally.runTurns / tally.runs).toFixed(1)} in a row on average`,
      );
      console.warn(
        '| Objective | Share of turns | Today’s move served it | Moves for it under another |',
      );
      console.warn('| --- | --- | --- | --- |');
      for (const o of OBJECTIVES) {
        const { turns, served } = tally.held[o];
        const share = ((100 * turns) / tally.runTurns).toFixed(1);
        const rate = turns === 0 ? '' : `${((100 * served) / turns).toFixed(0)}%`;
        console.warn(`| ${o} | ${share}% | ${rate} | ${tally.elsewhere[o]} |`);
      }
    },
    900_000,
  );
});
