import { DISCIPLINES } from '@/systems/techniques';
import { ctx } from '@/test/gameFixtures';

import {
  against,
  classmate,
  classmateIds,
  contentBench,
  dRankFoeIds,
  foe,
  freshCharacter,
  mirror,
  type ContentReport,
} from './content';

/**
 * THE CONTENT BENCH
 *
 * The archetype bench keeps fighters' stats even; the pack's own people are not even. These
 * fights are the ones a new player actually has: a character fresh out of creation, of every
 * specialty, on their first (default) plan, against an AI copy of themselves, the genin of
 * their year and the foes of D-rank jobs. The combat review found a fresh genin winning a few
 * percent of these, one technique deciding a fight before the plan could matter; these targets
 * keep it from coming back.
 */

/**
 * A fresh character's plan against the same fighter on the foes' instincts: about even, the plan
 * a little ahead. (Measured over 1000 fights when the avoid roll landed, a plan won 0.46–0.68
 * by specialty; the old 0.65 ceiling passed only on a lucky 200-fight sample.)
 */
const MIRROR = { min: 0.4, max: 0.7 } as const;
const MIRROR_SEEDS = 1000;
/** A thousand fights take a while on a slow runner. */
const MIRROR_TIMEOUT_MS = 60_000;
/** Against the genin of their year, a fresh character wins this often on average… */
const CLASSMATES_AVERAGE = 0.25;
/** …and no specialty falls below this. */
const CLASSMATES_FLOOR = 0.1;
/** Fights with classmates last two rounds or more: long enough for the plan to matter. */
const CLASSMATE_EXCHANGES = 8;
/** At most this share of fights sees a single hit take half the health. */
const HEAVY_HITS = 0.05;
/** Against D-rank foes, each specialty wins at least this share on average. */
const D_FOES_FLOOR = 0.35;
/**
 * Someone who doesn't use chakra (no more reserves than this) is an easy win one on one for any
 * graduate: a thug, a poacher, an archer. Their danger is numbers…
 */
const ORDINARY_CHAKRA = 10;
const ORDINARY_FLOOR = 0.9;
/** …so a gang of them is more than a graduate alone can take. */
const GANG = ['bandit-thug', 'bandit-thug', 'bandit-thug'] as const;
const GANG_CEILING = 0.3;
/** And the hardest D-rank foe is still a real fight for every specialty. */
const HARDEST_CEILING = 0.75;

const SEEDS = 100;

function average(reports: readonly ContentReport[], of: (r: ContentReport) => number): number {
  return reports.reduce((sum, r) => sum + of(r), 0) / reports.length;
}

const builds = DISCIPLINES.map((specialty) => {
  const state = freshCharacter(specialty);
  return {
    specialty,
    state,
    classmates: classmateIds(state).map((id) =>
      contentBench(against(state, classmate(state, id)), SEEDS),
    ),
    foes: dRankFoeIds().map((id) => ({ id, ...contentBench(against(state, foe(id)), SEEDS) })),
    gang: contentBench(
      {
        ...against(state, foe(GANG[0])),
        enemies: GANG.map((id, i) => ({ ...foe(id), id: `${id}#${i}` })),
      },
      SEEDS,
    ),
  };
});

describe('a fresh character in the fights the game gives them', () => {
  it.each(DISCIPLINES)(
    'a %s specialist and an AI copy each win about half',
    (specialty) => {
      const report = contentBench(mirror(freshCharacter(specialty)), MIRROR_SEEDS);
      expect(report.winRate).toBeGreaterThanOrEqual(MIRROR.min);
      expect(report.winRate).toBeLessThanOrEqual(MIRROR.max);
    },
    MIRROR_TIMEOUT_MS,
  );

  it('holds their own against the genin of their year', () => {
    const all = builds.flatMap((b) => b.classmates);
    expect(average(all, (r) => r.winRate)).toBeGreaterThanOrEqual(CLASSMATES_AVERAGE);
    for (const build of builds) {
      expect(average(build.classmates, (r) => r.winRate)).toBeGreaterThanOrEqual(CLASSMATES_FLOOR);
    }
  });

  it('fights classmates for two rounds or more, and no single hit takes half their health', () => {
    for (const build of builds) {
      expect(average(build.classmates, (r) => r.avgExchanges)).toBeGreaterThanOrEqual(
        CLASSMATE_EXCHANGES,
      );
      expect(average(build.classmates, (r) => r.heavyHitRate)).toBeLessThanOrEqual(HEAVY_HITS);
    }
  });

  it.each(DISCIPLINES)('a %s specialist can take on D-rank work', (specialty) => {
    const build = builds.find((b) => b.specialty === specialty)!;
    expect(average(build.foes, (r) => r.winRate)).toBeGreaterThanOrEqual(D_FOES_FLOOR);
    expect(Math.min(...build.foes.map((r) => r.winRate))).toBeLessThanOrEqual(HARDEST_CEILING);
  });

  it.each(DISCIPLINES)('a %s specialist beats an ordinary person but not a gang', (specialty) => {
    const build = builds.find((b) => b.specialty === specialty)!;
    const ordinary = build.foes.filter(
      (r) => ctx.content.enemies.require(r.id).maxChakra <= ORDINARY_CHAKRA,
    );
    expect(ordinary.length).toBeGreaterThan(0);
    for (const r of ordinary) expect(r.winRate, r.id).toBeGreaterThanOrEqual(ORDINARY_FLOOR);
    expect(build.gang.winRate).toBeLessThanOrEqual(GANG_CEILING);
  });
});
