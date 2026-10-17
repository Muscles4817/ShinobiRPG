import { fightingPower, partyPower } from '@/systems/stats';

import { plainAtGrade, plainFighter } from './archetypes';
import { evenLine, type FighterSpec } from './fighters';
import { benchSkirmish, type BenchReport } from './runner';

/**
 * THE RETINUE BENCH (`docs/design/retinue-plan.md`)
 *
 * A fighter with a companion at heel, through the Plan & Watch engine. By default a companion
 * is simply a second body on their side: it hits no harder for being theirs (combination
 * techniques and what a bond unlocks come later, and are earned). A retinue is a real
 * advantage, not a balanced one, so the bench checks that it is honest:
 *  - a companion is a real advantage: an even fight turns into a rare win;
 *  - the read says so: the pair rates beyond even, by the rating scouting uses;
 *  - the companion is worth its own grade: a stronger one is worse to face.
 * Set VITE_BENCH_REPORT=true to print every measurement.
 */

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';
const SEEDS = 80;
/** "Rarely". */
const RARELY = 0.15;

const handler = plainAtGrade('D');
const hound = (value: number): FighterSpec => ({ ...plainFighter(value), name: `Hound ${value}` });

function versus(label: string, player: FighterSpec, foes: readonly FighterSpec[]): BenchReport {
  const report = benchSkirmish({ player, allies: [], foes }, SEEDS);
  if (REPORT) console.warn(`${label}: won ${Math.round(report.winRate * 100)}%`);
  return report;
}

describe('retinues', () => {
  it('a companion is a real advantage: an even fight becomes a rare win', () => {
    const you = plainAtGrade('D');
    expect(versus('Even fight', you, [handler]).winRate).toBeGreaterThan(0.3);
    expect(versus('Against the pair', you, [handler, hound(5)]).winRate).toBeLessThan(RARELY);
  });

  it('the read says so: the pair rates beyond an even match', () => {
    const alone = fightingPower(evenLine(10));
    const pair = partyPower([alone, fightingPower(evenLine(5))]);
    // Within 15% is "evenly matched" (`game/scouting.ts`).
    expect(pair / alone).toBeGreaterThan(1.15);
  });

  it('a companion is worth its own grade: a stronger one is worse to face', () => {
    const you = { ...plainFighter(11), name: 'Plain 11' };
    const pup = versus('Against a pup', you, [handler, hound(3)]);
    const grown = versus('Against a grown hound', you, [handler, hound(7)]);
    expect(grown.avgHealthLeft).toBeLessThan(pup.avgHealthLeft);
    expect(grown.winRate).toBeLessThan(pup.winRate);
  });
});
