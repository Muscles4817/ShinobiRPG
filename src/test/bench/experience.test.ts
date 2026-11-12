import type { CombatSetup } from '@/systems/combat';

import { plainAtGrade } from './archetypes';
import {
  against,
  classmate,
  classmateIds,
  dRankFoeIds,
  foe,
  freshCharacter,
  mirror,
} from './content';
import { describeExperience, experience, replanner, type ExperienceReport } from './experience';
import { toSetup, type FighterSpec } from './fighters';

/**
 * What fights are like to play (audit P0.4), held to baselines as the prose lint holds its
 * budget: a change may make fights better to play (more plan screens, fewer repeats and lost
 * turns, fewer fights over in one plan), never worse without a new baseline and a reason in its
 * pull request. Set VITE_BENCH_REPORT=true (with `--silent=false`) to print every measurement.
 */

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';
const SEEDS = 30;
/** Room for a measure to move before it counts as worse. */
const SLACK = 0.01;

interface Baseline {
  readonly planScreens: number;
  readonly repeatShare: number;
  readonly lostShare: number;
  readonly oneScreenShare: number;
}

/** The measures when they landed (P0.4). */
export const BASELINES: Readonly<Record<string, Baseline>> = {
  'equals (C)': { planScreens: 2.567, repeatShare: 0.8, lostShare: 0.063, oneScreenShare: 0 },
  'one grade up (C v B)': {
    planScreens: 2,
    repeatShare: 0.734,
    lostShare: 0.215,
    oneScreenShare: 0,
  },
  'one grade down (B v C)': {
    planScreens: 2,
    repeatShare: 0.625,
    lostShare: 0.013,
    oneScreenShare: 0,
  },
  'fresh genin v a classmate': {
    planScreens: 3.233,
    repeatShare: 0.823,
    lostShare: 0.077,
    oneScreenShare: 0,
  },
  'fresh genin v a D-rank foe': {
    planScreens: 1,
    repeatShare: 0.167,
    lostShare: 0.069,
    oneScreenShare: 1,
  },
  'fresh genin v their mirror': {
    planScreens: 6.1,
    repeatShare: 0.875,
    lostShare: 0.228,
    oneScreenShare: 0,
  },
};

function duel(player: FighterSpec, opponent: FighterSpec): CombatSetup {
  return {
    player: toSetup(player, 'player'),
    allies: [],
    enemies: [toSetup(opponent, 'foe')],
    canFlee: false,
  };
}

const fresh = freshCharacter('taijutsu');
const CASES: Readonly<Record<string, CombatSetup>> = {
  'equals (C)': duel(plainAtGrade('C'), plainAtGrade('C')),
  'one grade up (C v B)': duel(plainAtGrade('C'), plainAtGrade('B')),
  'one grade down (B v C)': duel(plainAtGrade('B'), plainAtGrade('C')),
  'fresh genin v a classmate': against(fresh, classmate(fresh, classmateIds(fresh)[0]!)),
  'fresh genin v a D-rank foe': against(fresh, foe(dRankFoeIds()[0]!)),
  'fresh genin v their mirror': mirror(fresh),
};

function holds(label: string, report: ExperienceReport): void {
  const base = BASELINES[label];
  if (!base) return;
  expect(report.planScreens).toBeGreaterThanOrEqual(base.planScreens - SLACK);
  expect(report.repeatShare).toBeLessThanOrEqual(base.repeatShare + SLACK);
  expect(report.lostShare).toBeLessThanOrEqual(base.lostShare + SLACK);
  expect(report.oneScreenShare).toBeLessThanOrEqual(base.oneScreenShare + SLACK);
}

describe('what fights are like to play', () => {
  for (const [label, setup] of Object.entries(CASES)) {
    it(`${label}: no worse than its baseline`, () => {
      const report = experience(setup, SEEDS);
      if (REPORT) console.warn(describeExperience(label, report));
      holds(label, report);
    });
  }

  it('says whether re-planning between rounds helps', () => {
    for (const label of ['equals (C)', 'fresh genin v their mirror']) {
      const replanned = experience(CASES[label]!, SEEDS, replanner);
      if (REPORT) console.warn(describeExperience(`${label}, re-planned`, replanned));
      expect(replanned.planScreens).toBeGreaterThan(0);
    }
  });
});
