import { statTier } from '@/systems/stats';

import { ARCHETYPE_IDS, archetype, foe, FOE_IDS, plainAtGrade, plainAtScale } from './archetypes';
import { GRADE_MIDPOINT, SCALES, SCALE_VALUES, type FighterSpec } from './fighters';
import { bench, endedWithin, fightOnce, summarise, wonWithin, type BenchReport } from './runner';

/**
 * THE COMBAT BENCH
 *
 * Fights archetypes and foes through the Plan & Watch engine over many seeds and checks the
 * two design principles and the lethality targets (progression plan, Part 2):
 *
 *  - Power is real: more resources beat fewer, head-on.        → asserted today.
 *  - Every weakness can be built around.                       → `it.todo` until gating lands.
 *  - Lethality targets (Phase 1, health 100 and gap damage):   → measured today, `it.todo`.
 *      equals:              about 1–2 rounds (4–8 exchanges);
 *      one grade apart:     the stronger side wins head-on within a round, mostly;
 *      two or more apart:   head-on, it's over in 1–2 exchanges.
 *
 * Tightening: when a phase lands, turn its `it.todo` into a real `it` using the named targets
 * below, and raise the loose thresholds that hold today. Set VITE_BENCH_REPORT=true to print
 * every measurement (`VITE_BENCH_REPORT=true npx vitest run src/test/bench`).
 */

/** "Most of the time", for the principles that hold today. */
const POWER_WIN_RATE = 0.8;

/** Plan & Watch plays four exchanges a round. */
const EXCHANGES_PER_ROUND = 4;
/** Target: equals take one to two rounds. */
const EQUALS_EXCHANGES = { min: 4, max: 2 * EXCHANGES_PER_ROUND } as const;
/** Target: one grade apart, the stronger side wins within a round this often. */
const ONE_GRADE_WIN_WITHIN_ROUND = 0.8;
/** Target: two or more grades apart, head-on fights end within this many exchanges… */
const TWO_GRADES_EXCHANGES = 2;
/** …this often. */
const TWO_GRADES_ENDED_RATE = 0.8;

/** The archetype-by-foe matrix is wide, so each pairing gets fewer seeds. */
const MATRIX_SEEDS = 10;

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';

function logged(player: FighterSpec, opponent: FighterSpec, report: BenchReport): BenchReport {
  if (REPORT) console.warn(summarise(player, opponent, report));
  return report;
}

function head(player: FighterSpec, opponent: FighterSpec): BenchReport {
  return logged(player, opponent, bench(player, opponent));
}

/** The archetypes who start every fight hidden. */
const HIDERS = ['illusionist', 'stalker'] as const;

const GRADE_LADDER = ['E', 'D', 'C', 'B', 'A'] as const;
const ONE_APART = GRADE_LADDER.slice(1).map((g, i) => [g, GRADE_LADDER[i]!] as const);
const TWO_APART = GRADE_LADDER.slice(2).map((g, i) => [g, GRADE_LADDER[i]!] as const);

describe('bench fighters', () => {
  it('sit in the grade bands their rank is known for', () => {
    expect(statTier(SCALE_VALUES.genin.peak).grade).toBe('D');
    expect(statTier(SCALE_VALUES.chunin.peak).grade).toBe('C');
    expect(statTier(SCALE_VALUES.jonin.strong).grade).toBe('B');
    expect(statTier(SCALE_VALUES.jonin.peak).grade).toBe('A');
    for (const grade of GRADE_LADDER) expect(statTier(GRADE_MIDPOINT[grade]).grade).toBe(grade);
  });

  it('fight the same way for the same seed', () => {
    const rusher = archetype('rusher', 'chunin');
    const brute = foe('brute', 'chunin');
    expect(fightOnce(rusher, brute, 7)).toEqual(fightOnce(rusher, brute, 7));
  });

  it('every archetype meets every foe at every scale and the fight ends or stalls cleanly', () => {
    for (const scale of SCALES) {
      for (const id of ARCHETYPE_IDS) {
        for (const opponent of FOE_IDS) {
          const [player, other] = [archetype(id, scale), foe(opponent, scale)];
          const report = logged(player, other, bench(player, other, MATRIX_SEEDS));
          expect(report.records).toHaveLength(MATRIX_SEEDS);
        }
      }
    }
  });
});

describe('power is real: more resources beat fewer, head-on', () => {
  it.each(ONE_APART)('a plain %s beats a plain %s', (stronger, weaker) => {
    expect(head(plainAtGrade(stronger), plainAtGrade(weaker)).winRate).toBeGreaterThanOrEqual(
      POWER_WIN_RATE,
    );
  });

  it.each(TWO_APART)('a plain %s beats a plain %s', (stronger, weaker) => {
    expect(head(plainAtGrade(stronger), plainAtGrade(weaker)).winRate).toBeGreaterThanOrEqual(
      POWER_WIN_RATE,
    );
  });

  it.each(ARCHETYPE_IDS)('a jōnin %s beats an everyday genin', (id) => {
    const report = head(archetype(id, 'jonin'), plainAtScale('genin'));
    expect(report.winRate).toBeGreaterThanOrEqual(POWER_WIN_RATE);
  });

  it('the wider the gap, the sooner it is over', () => {
    const equals = head(plainAtGrade('C'), plainAtGrade('C'));
    const oneApart = head(plainAtGrade('C'), plainAtGrade('D'));
    const twoApart = head(plainAtGrade('C'), plainAtGrade('E'));
    expect(oneApart.avgExchanges).toBeLessThan(equals.avgExchanges);
    expect(twoApart.avgExchanges).toBeLessThan(oneApart.avgExchanges);
    expect(twoApart.avgHealthLeft).toBeGreaterThan(oneApart.avgHealthLeft);
  });
});

describe('lethality (Phase 1 targets, measured today)', () => {
  // Measured, not asserted: today equals take about 16–20 exchanges, one grade apart about
  // 12–13, two apart about 9. The `it.todo`s below become real once health 100 and gap
  // damage (step 1.1) land. Until then this keeps the numbers one env flag away.
  it('measures every grade pairing', () => {
    for (const grade of GRADE_LADDER) {
      const report = head(plainAtGrade(grade), plainAtGrade(grade));
      expect(report.avgExchanges).toBeGreaterThan(0);
    }
    for (const [stronger, weaker] of [...ONE_APART, ...TWO_APART]) {
      const report = head(plainAtGrade(stronger), plainAtGrade(weaker));
      const within = {
        round: wonWithin(report, EXCHANGES_PER_ROUND),
        quick: endedWithin(report, TWO_GRADES_EXCHANGES),
      };
      if (REPORT) console.warn(`  won within a round ${within.round}, ended in 2 ${within.quick}`);
      expect(within.round).toBeGreaterThanOrEqual(0);
    }
  });

  it.todo(
    `equals at every grade finish in ${EQUALS_EXCHANGES.min}–${EQUALS_EXCHANGES.max} exchanges on average`,
  );
  it.todo(
    `one grade apart, the stronger wins within ${EXCHANGES_PER_ROUND} exchanges ` +
      `${ONE_GRADE_WIN_WITHIN_ROUND * 100}% of the time`,
  );
  it.todo(
    `two or more grades apart, ${TWO_GRADES_ENDED_RATE * 100}% of fights end within ` +
      `${TWO_GRADES_EXCHANGES} exchanges`,
  );
  it.todo('equals win about half their fights (today the player side wins only a third)');
});

describe('every weakness can be built around (Phase 1–4 target)', () => {
  it.todo('a rusher with the right plan beats or escapes a trickster one grade up');
  it.todo('a versatile fighter low on stamina outlasts a brute of the same rank');
});

describe('hiding has counterplay (step 1.4b)', () => {
  it.each(SCALES)('%s fighters who start hidden still get hit', (scale) => {
    for (const id of HIDERS) {
      for (const opponent of FOE_IDS) {
        const report = head(archetype(id, scale), foe(opponent, scale));
        expect(report.avgHealthLeft).toBeLessThan(1);
      }
    }
  });

  it.each(SCALES)('%s hidden fighters do not stall each other', (scale) => {
    for (const id of HIDERS) {
      const report = head(archetype(id, scale), foe('trickster', scale));
      expect(report.stalemateRate).toBe(0);
    }
  });

  // Measured, not asserted: slotting a sense in place of a basic attack doesn't yet swing
  // a fight against a stalker (the stalker's damage decides it within 7–8 exchanges, before
  // being found matters much). Revisit once health 100 and gap damage (step 1.1) land.
  it.todo('a fighter who slots a sense fares better against a stalker than one who does not');
});
