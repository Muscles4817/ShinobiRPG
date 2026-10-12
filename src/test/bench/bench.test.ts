import { statTier } from '@/systems/stats';

import { ARCHETYPE_IDS, archetype, foe, FOE_IDS, plainAtGrade, plainAtScale } from './archetypes';
import {
  GRADE_MIDPOINT,
  SCALES,
  SCALE_VALUES,
  techniques,
  type FighterSpec,
  type Scale,
} from './fighters';
import {
  bench,
  benchSkirmish,
  endedWithin,
  fightOnce,
  summarise,
  wonWithin,
  type BenchReport,
  type Skirmish,
} from './runner';

/**
 * THE COMBAT BENCH
 *
 * Fights archetypes and foes through the Plan & Watch engine over many seeds and checks the
 * two design principles and the lethality targets (progression plan, Part 2):
 *
 *  - Power is real: more resources beat fewer, head-on.        → asserted today.
 *  - Every weakness can be built around.                       → `it.todo` until gating lands.
 *  - Lethality targets (Phase 1, health 100 and gap damage):   → asserted since step 1.1.
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

describe('lethality (Phase 1 targets)', () => {
  it.each(GRADE_LADDER)(
    `equals at grade %s finish in ${EQUALS_EXCHANGES.min}–${EQUALS_EXCHANGES.max} exchanges on average`,
    (grade) => {
      const report = head(plainAtGrade(grade), plainAtGrade(grade));
      expect(report.avgExchanges).toBeGreaterThanOrEqual(EQUALS_EXCHANGES.min);
      expect(report.avgExchanges).toBeLessThanOrEqual(EQUALS_EXCHANGES.max);
    },
  );

  it.each(ONE_APART)(
    `one grade apart, a plain %s beats a plain %s within ${EXCHANGES_PER_ROUND} exchanges ` +
      `${ONE_GRADE_WIN_WITHIN_ROUND * 100}% of the time`,
    (stronger, weaker) => {
      const report = head(plainAtGrade(stronger), plainAtGrade(weaker));
      const within = wonWithin(report, EXCHANGES_PER_ROUND);
      if (REPORT) console.warn(`  won within a round ${within}`);
      expect(within).toBeGreaterThanOrEqual(ONE_GRADE_WIN_WITHIN_ROUND);
    },
  );

  it.each(TWO_APART)(
    `two grades apart, a plain %s against a plain %s is over within ` +
      `${TWO_GRADES_EXCHANGES} exchanges ${TWO_GRADES_ENDED_RATE * 100}% of the time`,
    (stronger, weaker) => {
      const report = head(plainAtGrade(stronger), plainAtGrade(weaker));
      const quick = endedWithin(report, TWO_GRADES_EXCHANGES);
      if (REPORT) console.warn(`  ended in ${TWO_GRADES_EXCHANGES} ${quick}`);
      expect(quick).toBeGreaterThanOrEqual(TWO_GRADES_ENDED_RATE);
    },
  );

  // The player plays their plan, the foe its instincts; the plan as a priority list (step
  // 1.2) is what should even this out. Today equals win about 40% of the time.
  it.todo('equals win about half their fights');
});

/** The same skirmish with everyone in the front row, to see what the rows change. */
function inOneLine({ player, allies, foes }: Skirmish): Skirmish {
  const front = (f: FighterSpec): FighterSpec => ({ ...f, row: 'front' });
  return { player: front(player), allies: allies.map(front), foes: foes.map(front) };
}

function skirmish(label: string, fight: Skirmish): BenchReport {
  const report = benchSkirmish(fight);
  if (REPORT) console.warn(`${label}: ${summarise(fight.player, fight.foes[0]!, report)}`);
  return report;
}

describe('rows (step 1.3)', () => {
  const twoBrutes = [foe('brute', 'chunin'), foe('brute', 'chunin')];
  const covered: Skirmish = {
    player: plainAtGrade('C'),
    allies: [foe('archer', 'chunin')],
    foes: twoBrutes,
  };

  it('the front row takes the blows meant for the back', () => {
    const rows = skirmish('C + archer v two brutes, in rows', covered);
    const line = skirmish('C + archer v two brutes, in one line', inOneLine(covered));
    expect(rows.avgHealthLeft).toBeLessThan(line.avgHealthLeft);
  });

  it('team fights end cleanly', () => {
    const wolf: FighterSpec = { ...plainAtGrade('D'), name: 'Wolf D', traits: ['pack'] };
    const pack: Skirmish = {
      player: plainAtGrade('C'),
      allies: [foe('archer', 'chunin')],
      foes: [wolf, wolf, foe('archer', 'genin')],
    };
    const report = skirmish('C + archer v two wolves and an archer', pack);
    expect(report.stalemateRate).toBe(0);
  });
});

describe('every weakness can be built around (Phase 1–4 target)', () => {
  it.todo('a rusher with the right plan beats or escapes a trickster one grade up');
  it.todo('a versatile fighter low on stamina outlasts a brute of the same rank');
});

describe('hiding has counterplay (step 1.4b)', () => {
  // A hider with little genjutsu behind it (the stalker) is found and hit by every foe. A
  // master illusionist is found too, but usually wins before it matters: power is real.
  it.each(SCALES)('a %s stalker who starts hidden still gets hit', (scale) => {
    for (const opponent of FOE_IDS) {
      const report = head(archetype('stalker', scale), foe(opponent, scale));
      expect(report.avgHealthLeft).toBeLessThan(1);
    }
  });

  it.each(SCALES)('%s hidden fighters do not stall each other', (scale) => {
    for (const id of HIDERS) {
      const report = head(archetype(id, scale), foe('trickster', scale));
      expect(report.stalemateRate).toBe(0);
    }
  });

  it.each(SCALES)('a %s fighter who knows a sense does better against hidden foes', (scale) => {
    // The versatile build without its sharp eyes (insight), with and without a sense.
    const { perks: _eyes, ...blind } = archetype('versatile', scale);
    const sensing = {
      ...blind,
      name: `${blind.name} with a sense`,
      techniques: [...blind.techniques, ...techniques(['wick-sense'])],
    };
    for (const hider of [archetype('stalker', scale), foe('trickster', scale)]) {
      expect(head(sensing, hider).winRate).toBeGreaterThan(head(blind, hider).winRate);
    }
  });
});

describe('fields, moves and substitutions find their niche (step 1.4c)', () => {
  // The same blade with and without its mist. Against brawlers the mist is the edge: they
  // swing half blind while the blade strikes from cover.
  const withoutMist = (spec: FighterSpec): FighterSpec => ({
    ...spec,
    name: `${spec.name} without mist`,
    techniques: spec.techniques.filter((t) => !t.effects.some((e) => e.verb === 'field')),
  });
  const brawler = (id: 'rusher' | 'powerhouse', scale: Scale): FighterSpec => {
    const { plan: _own, ...spec } = archetype(id, scale);
    return spec;
  };

  it.each(SCALES)('a %s mist blade beats brawlers more often in its mist', (scale) => {
    const misty = archetype('mistBlade', scale);
    for (const id of ['rusher', 'powerhouse'] as const) {
      const opponent = brawler(id, scale);
      expect(head(misty, opponent).winRate).toBeGreaterThan(
        head(withoutMist(misty), opponent).winRate,
      );
    }
  });

  it.each(SCALES)('a %s mist blade comes out of a brute fight in better shape', (scale) => {
    const misty = archetype('mistBlade', scale);
    const brute = foe('brute', scale);
    expect(head(misty, brute).avgHealthLeft).toBeGreaterThan(
      head(withoutMist(misty), brute).avgHealthLeft,
    );
  });

  it.each(SCALES)('a %s fragile fighter lasts longer with a substitution', (scale) => {
    // The versatile build is short on stamina; a substitution buys it time, not invulnerability.
    const versatile = archetype('versatile', scale);
    const plain: FighterSpec = {
      ...versatile,
      plan: {
        close: ['jutsu:palm-strike', 'strike', 'guard'],
        mid: ['step-in', 'jutsu:ember-breath', 'throw'],
        far: ['step-in', 'jutsu:ember-breath', 'throw'],
      },
    };
    const swapping: FighterSpec = {
      ...versatile,
      name: `${versatile.name} with a substitution`,
      techniques: [...versatile.techniques, ...techniques(['lantern-husk'])],
      plan: {
        close: ['jutsu:palm-strike', 'strike', 'jutsu:lantern-husk'],
        mid: ['step-in', 'jutsu:ember-breath', 'jutsu:lantern-husk'],
        far: ['step-in', 'jutsu:ember-breath', 'jutsu:lantern-husk'],
      },
    };
    const brute = foe('brute', scale);
    expect(head(swapping, brute).avgExchanges).toBeGreaterThan(head(plain, brute).avgExchanges);
  });
});

describe('empower, clone and trap (step 1.4d)', () => {
  const ready = ['kindled-pulse', 'lantern-shades', 'snare-ward'] as const;
  const knowing = (f: FighterSpec, id: string): FighterSpec => ({
    ...f,
    name: `${f.name} with ${id}`,
    techniques: [...f.techniques, ...techniques([id])],
  });

  it.each(ready)('knowing %s wins more often against an equal', (id) => {
    const plain = plainAtGrade('C');
    const report = head(knowing(plain, id), plain);
    expect(report.winRate).toBeGreaterThan(head(plain, plain).winRate);
    expect(report.stalemateRate).toBe(0);
  });

  it.each(ready)('knowing %s does not close a whole grade: power is real', (id) => {
    const report = head(knowing(plainAtGrade('C'), id), plainAtGrade('B'));
    expect(report.winRate).toBeLessThan(1 - POWER_WIN_RATE);
  });
});
