import {
  gradeModifiers,
  gradesFromQuickPick,
  gradesProblem,
  gradeStatBonuses,
  pointsSpent,
  POINT_BUDGET,
  topDisciplines,
  ALL_PASSING,
} from './grades';

describe('grades', () => {
  const quick = gradesFromQuickPick({
    specialty: 'ninjutsu',
    strength: 'kenjutsu',
    weakness: 'genjutsu',
  });

  it('turns a quick pick into A, B and D grades', () => {
    expect(quick).toEqual({
      taijutsu: 'C',
      ninjutsu: 'A',
      genjutsu: 'D',
      kenjutsu: 'B',
      fuuinjutsu: 'C',
    });
  });

  it('a quick pick spends exactly the point-buy budget', () => {
    expect(pointsSpent(quick)).toBe(POINT_BUDGET);
    expect(gradesProblem(quick)).toBeNull();
  });

  it('refuses point buys over budget', () => {
    expect(gradesProblem({ ...ALL_PASSING, taijutsu: 'A', ninjutsu: 'A' })).toBe(
      'That costs 6 points; you have 3.',
    );
  });

  it('lets weaknesses pay for a second A', () => {
    const grades = {
      taijutsu: 'A',
      ninjutsu: 'A',
      genjutsu: 'D',
      kenjutsu: 'D',
      fuuinjutsu: 'D',
    } as const;
    expect(gradesProblem(grades)).toBeNull();
    expect(topDisciplines(grades)).toEqual(['taijutsu', 'ninjutsu']);
  });

  it('grades shape starting stats and growth', () => {
    expect(gradeStatBonuses(quick).ninjutsu).toBe(3);
    expect(gradeStatBonuses(quick).genjutsu).toBe(-1);
    expect(gradeModifiers(quick).growth?.ninjutsu).toBe(1.25);
  });
});
