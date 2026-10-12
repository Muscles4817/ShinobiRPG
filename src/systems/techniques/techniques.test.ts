import { createStats } from '@/systems/stats';

import {
  controlStudyFactor,
  gradeToAttempt,
  learnability,
  UNSTABLE_STUDY,
  type StudySource,
} from './learning';
import {
  EMPTY_BOOK,
  learnBlocker,
  sessionStudyPoints,
  steadied,
  steady,
  study,
  studyPoints,
  unstableFor,
  type Learner,
  type TechniqueDef,
} from './techniques';

const fireball: TechniqueDef = {
  id: 'fireball',
  name: 'Fireball',
  description: '',
  discipline: 'ninjutsu',
  element: 'fire',
  effects: [{ verb: 'damage', power: 15 }],
  chakraCost: 10,
  rank: 'D',
  difficulty: 30,
};

/** Stats of 5 are grade E, 10 grade D, 15 grade C. */
function learner(value: number, more: Partial<Learner> = {}): Learner {
  return { stats: createStats(value), clanId: 'none', nature: 'fire', ...more };
}

const lookup = (id: string) => (id === fireball.id ? fireball : undefined);

describe('technique ranks', () => {
  it('compares a rank with a grade: normal, unstable a rank above, impossible two above', () => {
    expect(learnability('D', 'D')).toBe('normal');
    expect(learnability('E', 'C')).toBe('normal');
    expect(learnability('C', 'D')).toBe('unstable');
    expect(learnability('B', 'D')).toBe('impossible');
    expect(learnability('S', 'E')).toBe('impossible');
  });

  it('names the grade that opens a rank', () => {
    expect(gradeToAttempt('B')).toBe('C');
    expect(gradeToAttempt('E')).toBe('E');
  });

  it('blocks a technique two ranks above your grade, and allows one a rank above', () => {
    const cRank = { ...fireball, rank: 'C' as const };
    expect(learnBlocker(EMPTY_BOOK, cRank, learner(5))).toEqual({
      kind: 'rank',
      rank: 'C',
      grade: 'E',
    });
    expect(learnBlocker(EMPTY_BOOK, cRank, learner(10))).toBeNull();
    expect(learnBlocker(EMPTY_BOOK, fireball, learner(5))).toBeNull();
  });

  it('accumulates progress then masters the technique', () => {
    const first = study(EMPTY_BOOK, fireball, 20);
    expect(first.mastered).toBe(false);
    expect(first.book.progress.fireball).toBe(20);

    const second = study(first.book, fireball, 20);
    expect(second.mastered).toBe(true);
    expect(second.book.known).toEqual(['fireball']);
    expect(second.book.unstable).toEqual([]);
    expect(second.book.progress.fireball).toBeUndefined();
  });

  it('a technique mastered a rank above arrives unstable, and steadies at its grade', () => {
    const { book } = study(EMPTY_BOOK, fireball, 40, true);
    expect(book.known).toEqual(['fireball']);
    expect(book.unstable).toEqual(['fireball']);
    expect(steadied(book, createStats(5), lookup)).toEqual([]);
    expect(steadied(book, createStats(8), lookup)).toEqual(['fireball']);
    expect(steady(book, ['fireball']).unstable).toEqual([]);
  });

  it('finds the known techniques above your grade', () => {
    expect(unstableFor(['fireball'], createStats(5), lookup)).toEqual(['fireball']);
    expect(unstableFor(['fireball'], createStats(9), lookup)).toEqual([]);
  });

  it('restricts clan techniques to clan members', () => {
    const clanJutsu = { ...fireball, clan: 'uchiha' };
    expect(learnBlocker(EMPTY_BOOK, clanJutsu, learner(10))).toEqual({
      kind: 'clan',
      clan: 'uchiha',
    });
    expect(learnBlocker(EMPTY_BOOK, clanJutsu, learner(10, { clanId: 'uchiha' }))).toBeNull();
  });

  it('blocks relearning a known technique', () => {
    const book = { known: ['fireball'], progress: {}, unstable: [] };
    expect(learnBlocker(book, fireball, learner(10))).toEqual({ kind: 'already-known' });
  });
});

describe('hard needs', () => {
  it('a nature, deep enough reserves and a grade of control', () => {
    const bolt = { ...fireball, needs: { nature: 'lightning' as const } };
    expect(learnBlocker(EMPTY_BOOK, bolt, learner(10))).toEqual({
      kind: 'nature',
      nature: 'lightning',
    });
    expect(learnBlocker(EMPTY_BOOK, bolt, learner(10, { nature: 'lightning' }))).toBeNull();

    const deep = { ...fireball, needs: { minReserves: 8 } };
    expect(learnBlocker(EMPTY_BOOK, deep, learner(5))).toEqual({
      kind: 'reserves',
      min: 8,
      have: 5,
    });
    expect(learnBlocker(EMPTY_BOOK, deep, learner(8))).toBeNull();

    const fine = { ...fireball, needs: { control: 'D' as const } };
    expect(learnBlocker(EMPTY_BOOK, fine, learner(5))).toEqual({
      kind: 'control',
      grade: 'D',
      have: 'E',
    });
    expect(learnBlocker(EMPTY_BOOK, fine, learner(8))).toBeNull();
  });
});

describe('study speed', () => {
  const base = { aptitude: 1, source: 'scroll' } as const;

  it('is the base points times aptitude and the source', () => {
    const stats = createStats(10);
    const points = sessionStudyPoints(stats, fireball, base);
    expect(points).toBeCloseTo(studyPoints(stats, fireball) * controlStudyFactor(10));
    expect(sessionStudyPoints(stats, fireball, { ...base, aptitude: 1.5 })).toBeCloseTo(
      points * 1.5,
    );
    expect(sessionStudyPoints(stats, fireball, { ...base, aptitude: 0 })).toBe(0);
    expect(sessionStudyPoints(stats, fireball, { ...base, source: 'teacher' })).toBeGreaterThan(
      points,
    );
  });

  it('ranks the sources: teacher, then library, then a bare scroll', () => {
    const stats = createStats(10);
    const at = (source: StudySource) => sessionStudyPoints(stats, fireball, { ...base, source });
    expect(at('library')).toBeCloseTo(at('scroll') * 1.1);
    expect(at('teacher')).toBeGreaterThan(at('library'));
  });

  it('is slower a rank above your grade', () => {
    const stats = createStats(5);
    const stable = { ...fireball, rank: 'E' as const };
    expect(sessionStudyPoints(stats, fireball, base)).toBeCloseTo(
      sessionStudyPoints(stats, stable, base) * UNSTABLE_STUDY,
    );
  });

  it('steadier chakra control learns chakra arts faster, and leaves taijutsu alone', () => {
    expect(controlStudyFactor(20)).toBeGreaterThan(controlStudyFactor(5));
    const stats = createStats(10);
    const fine = { ...stats, chakraControl: 25 };
    expect(sessionStudyPoints(fine, fireball, base) / studyPoints(fine, fireball)).toBeGreaterThan(
      sessionStudyPoints(stats, fireball, base) / studyPoints(stats, fireball),
    );
    const kick = { ...fireball, discipline: 'taijutsu' as const };
    expect(sessionStudyPoints(fine, kick, base)).toBeCloseTo(studyPoints(fine, kick));
  });
});
