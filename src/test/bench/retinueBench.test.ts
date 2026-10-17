import { fightingPower, partyPower } from '@/systems/stats';

import { plainAtGrade, plainFighter } from './archetypes';
import { evenLine, techniques, type FighterSpec } from './fighters';
import { benchSkirmish, type BenchReport } from './runner';

/**
 * THE RETINUE BENCH (`docs/design/retinue-plan.md`)
 *
 * A fighter with a companion at heel, through the Plan & Watch engine. A retinue is a real
 * advantage, not a balanced one, so the bench checks that it is honest and that it can be
 * answered:
 *  - a companion is a real advantage: an even fight turns into a rare win;
 *  - the read says so: the pair rates beyond even, by the rating scouting uses;
 *  - partners fight as one: the same two bodies, linked, are worse to face than unlinked;
 *  - breaking them up works: a daze takes much of the tandem's edge away.
 * Set VITE_BENCH_REPORT=true to print every measurement.
 */

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';
const SEEDS = 80;
/** A fighter with the bench's foe id, so a companion can name them as its master. */
const MASTER_ID = 'foe';
/** "Rarely". */
const RARELY = 0.15;
/** A tandem worth having: this much less often won against the linked pair. */
const TANDEM_SWING = 0.15;
/** A daze answers the tandem: it keeps no more than this share of its edge. */
const DAZED_TANDEM_KEPT = 0.75;

/** A handler at a grade's middle, and a hound at an E-grade's. */
const handler = plainAtGrade('D');
function hound(linked: boolean): FighterSpec {
  return { ...plainFighter(5), name: 'Hound', ...(linked ? { master: MASTER_ID } : {}) };
}

function versus(label: string, player: FighterSpec, foes: readonly FighterSpec[]): BenchReport {
  const report = benchSkirmish({ player, allies: [], foes }, SEEDS);
  if (REPORT) console.warn(`${label}: won ${Math.round(report.winRate * 100)}%`);
  return report;
}

/** How much less often you win against the linked pair than the same two unlinked. */
function tandemSwing(player: FighterSpec): number {
  const apart = versus(`${player.name} vs pair apart`, player, [handler, hound(false)]);
  const together = versus(`${player.name} vs pair together`, player, [handler, hound(true)]);
  return apart.winRate - together.winRate;
}

describe('retinues', () => {
  it('a companion is a real advantage: an even fight becomes a rare win', () => {
    const you = plainAtGrade('D');
    expect(versus('Even fight', you, [handler]).winRate).toBeGreaterThan(0.3);
    expect(versus('Against the pair', you, [handler, hound(true)]).winRate).toBeLessThan(RARELY);
  });

  it('the read says so: the pair rates beyond an even match', () => {
    const alone = fightingPower(evenLine(10));
    const pair = partyPower([alone, fightingPower(evenLine(5))]);
    // Within 15% is "evenly matched" (`game/scouting.ts`).
    expect(pair / alone).toBeGreaterThan(1.15);
  });

  it('partners fight as one: linked, the same two bodies are worse to face', () => {
    expect(tandemSwing({ ...plainFighter(11), name: 'Plain 11' })).toBeGreaterThan(TANDEM_SWING);
  });

  it('breaking them up works: a daze takes much of the tandem’s edge away', () => {
    const plain = { ...plainFighter(11), name: 'Plain 11' };
    const dazer = { ...plain, name: 'Dazer', techniques: techniques(['static-touch']) };
    expect(tandemSwing(dazer)).toBeLessThan(tandemSwing(plain) * DAZED_TANDEM_KEPT);
  });
});
