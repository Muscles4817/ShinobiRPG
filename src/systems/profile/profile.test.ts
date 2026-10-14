import { evenAptitude, nothingKnown } from '@/systems/stats';

import { fileBalance, fileProblems, fileStartBonuses, type AcademyFile } from './academyFile';
import { archetypeOffered, quickFile, type Student } from './archetypes';
import { developmentCost, developmentProblems, maxStepsFor, stepsCost } from './development';
import { giftProblems, giftsKnown, withGifts } from './gifts';
import { gradeFor, gradesFor, topDisciplines } from './grades';
import { standingFromRoll, STANDING_INFO } from './standing';

const NO_EARLY = { points: 0 };

function student(standing: Student['standing'], clanArts: Student['clanArts'] = []): Student {
  return { standing, clanArts, early: NO_EARLY };
}

describe('grades', () => {
  it('read the report card off the arts a student graduates with', () => {
    expect([4, 5, 9, 12].map(gradeFor)).toEqual(['D', 'C', 'B', 'A']);
    const card = gradesFor({ taijutsu: 13, ninjutsu: 9, genjutsu: 5, kenjutsu: 4, fuuinjutsu: 5 });
    expect(card).toEqual({
      taijutsu: 'A',
      ninjutsu: 'B',
      genjutsu: 'C',
      kenjutsu: 'D',
      fuuinjutsu: 'C',
    });
    expect(topDisciplines(card)).toEqual(['taijutsu']);
  });
});

describe('development', () => {
  it('costs more the further a stat already is', () => {
    expect([1, 2, 3, 4].map(stepsCost)).toEqual([1, 2, 4, 6]);
    expect(developmentCost({ speed: 2, taijutsu: 4 })).toBe(8);
  });

  it('lets only the best of the year take a stat to C', () => {
    const middle = STANDING_INFO.middle.development;
    const genius = STANDING_INFO.genius.development;
    expect(maxStepsFor({}, 'speed', middle)).toBe(3);
    expect(maxStepsFor({}, 'speed', genius)).toBe(4);
    expect(maxStepsFor({ taijutsu: 4, speed: 4, stamina: 4 }, 'strength', genius)).toBe(3);
    expect(developmentProblems({ taijutsu: 4 }, middle)).toEqual([
      'Nobody in your standing graduates with a stat that far along.',
    ]);
    expect(developmentProblems({ taijutsu: 3, speed: 3, stamina: 2 }, middle)).toEqual([]);
    expect(developmentProblems({ taijutsu: 3, speed: 3, stamina: 3 }, middle)).toEqual([
      'That training costs 12 points; you have 10.',
    ]);
  });
});

describe('gifts', () => {
  it('lay known talent over the roll: gifts as a floor, flaws as a ceiling', () => {
    const rolled = evenAptitude(1);
    const gifted = withGifts(rolled, { speed: 'gifted', taijutsu: 'prodigy', reserves: 'flawed' });
    expect(gifted.speed).toBe(1.3);
    expect(gifted.taijutsu).toBe(1.6);
    expect(gifted.reserves).toBe(0.65);
    expect(gifted.strength).toBe(1);
    expect(withGifts(evenAptitude(1.5), { speed: 'gifted' }).speed).toBe(1.5);
  });

  it('are known from the first day', () => {
    const known = giftsKnown(nothingKnown(), { speed: 'gifted', intellect: 'flawed' });
    expect(known.speed).toBe('sense');
    expect(known.intellect).toBe('sense');
    expect(known.strength).toBe('unknown');
  });

  it('keep to what the standing allows', () => {
    const middle = STANDING_INFO.middle.gifts;
    expect(giftProblems({ speed: 'gifted' }, middle, 'on-time')).toEqual([]);
    expect(giftProblems({ speed: 'gifted', strength: 'gifted' }, middle, 'on-time')).toEqual([
      'Those gifts take 2; your file has room for 1.',
    ]);
    expect(giftProblems({ speed: 'gifted', strength: 'gifted' }, middle, 'late')).toEqual([]);
    expect(giftProblems({ speed: 'prodigy' }, STANDING_INFO.top.gifts, 'on-time')).toContain(
      'Only the genius of the year has a prodigy’s gift.',
    );
    expect(giftProblems({}, STANDING_INFO['dead-last'].gifts, 'early')).toEqual([
      'An early bloomer gives up a gift, and you have none to give.',
    ]);
  });
});

describe('the academy file', () => {
  const file: AcademyFile = {
    development: { taijutsu: 3, speed: 3 },
    gifts: { taijutsu: 'gifted', intellect: 'flawed' },
    bloom: 'early',
  };

  it('balances training, gifts and flaws against the standing and upbringing', () => {
    // 10 for the middle, 2 for a flaw, 3 for blooming early; 8 spent.
    expect(fileBalance(file, 'middle', NO_EARLY)).toEqual({ points: 7, gifts: -1, flaws: 0 });
    expect(fileProblems(file, 'middle', NO_EARLY)).toEqual([
      'Those gifts take 1; your file has room for 0.',
    ]);
  });

  it('starts flawed stats a little low', () => {
    expect(fileStartBonuses(file)).toMatchObject({ taijutsu: 6, speed: 6, intellect: -1 });
  });

  it('holds an upbringing to the training it insists on', () => {
    const early = { points: 3, focus: { stats: ['kenjutsu', 'strength'] as const, points: 2 } };
    const blank: AcademyFile = { development: {}, gifts: {}, bloom: 'on-time' };
    expect(fileProblems(blank, 'middle', early)).toEqual([
      'Your upbringing put at least 2 points of training into its arts.',
    ]);
    expect(fileProblems({ ...blank, development: { kenjutsu: 2 } }, 'middle', early)).toEqual([]);
  });
});

describe('quick picks', () => {
  const pick = { archetype: 'steady', specialty: 'taijutsu' } as const;

  it('spend the whole file, and never more than it allows', () => {
    for (const standing of ['dead-last', 'middle', 'top', 'genius'] as const) {
      const filled = quickFile(pick, student(standing));
      expect(fileProblems(filled, standing, NO_EARLY)).toEqual([]);
      expect(fileBalance(filled, standing, NO_EARLY).points).toBe(0);
    }
  });

  it('give a genius prodigy Cs and a prodigy’s gift', () => {
    const filled = quickFile({ ...pick, archetype: 'prodigy' }, student('genius'));
    expect(filled.gifts.taijutsu).toBe('prodigy');
    expect(filled.development).toMatchObject({ taijutsu: 4, speed: 4, perception: 4 });
  });

  it('train a clan heir in the clan’s arts, and offer heirs only to clans', () => {
    const heir = student('middle', ['kenjutsu', 'strength']);
    const filled = quickFile({ ...pick, archetype: 'clan-heir' }, heir);
    expect(filled.development.kenjutsu).toBe(3);
    expect(filled.gifts.kenjutsu).toBe('gifted');
    expect(archetypeOffered('clan-heir', student('middle'))).toBe(false);
    expect(archetypeOffered('prodigy', student('top'))).toBe(false);
  });

  it('meet an upbringing’s focus before anything else', () => {
    const raised = {
      ...student('dead-last'),
      early: { points: 2, focus: { stats: ['strength', 'speed'] as const, points: 2 } },
    };
    const filled = quickFile({ ...pick, archetype: 'bookworm' }, raised);
    expect(fileProblems(filled, 'dead-last', raised.early)).toEqual([]);
    expect(filled.gifts.stamina).toBe('flawed');
  });
});

describe('standing', () => {
  it('deals standings by their weights', () => {
    expect(standingFromRoll(0)).toBe('dead-last');
    expect(standingFromRoll(0.5)).toBe('middle');
    expect(standingFromRoll(0.99)).toBe('genius');
  });
});
