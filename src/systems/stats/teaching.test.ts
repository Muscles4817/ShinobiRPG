import { applyTraining, trainingGain } from './growth';
import { soloEfficiency } from './solo';
import { createStats } from './stats';
import { teacherEfficiency, teacherGap, WEAKER_TEACHER_SCALE } from './teaching';

/** Values in the lower part of each grade's band: E, D, C, B, A, S. */
const E = 3;
const D = 9;
const C = 14;
const B = 21;
const A = 30;
const S = 45;

describe('teaching', () => {
  it('measures the gap in grades, capped at two up', () => {
    expect(teacherGap(C, C)).toBe(0);
    expect(teacherGap(C, B)).toBe(1);
    expect(teacherGap(C, A)).toBe(2);
    expect(teacherGap(C, S)).toBe(2);
    expect(teacherGap(C, D)).toBe(-1);
    expect(teacherGap(E, S)).toBe(2);
  });

  it('makes an equal a little better than practising alone', () => {
    for (const v of [E, D, C, B]) {
      const solo = soloEfficiency(v);
      expect(teacherEfficiency(v, v)).toBeGreaterThan(solo);
      expect(teacherEfficiency(v, v)).toBeLessThan(solo * 1.5);
    }
  });

  it('makes one grade up good and two very good, and three no better than two', () => {
    for (const [mine, up1, up2, up3] of [
      [E, D, C, B],
      [D, C, B, A],
      [C, B, A, S],
    ] as const) {
      const equal = teacherEfficiency(mine, mine);
      expect(teacherEfficiency(mine, up1)).toBeGreaterThan(equal);
      expect(teacherEfficiency(mine, up2)).toBeGreaterThan(teacherEfficiency(mine, up1));
      expect(teacherEfficiency(mine, up3)).toBe(teacherEfficiency(mine, up2));
    }
  });

  it('lifts a stalled stat: at C a better teacher is many times a solo session', () => {
    expect(teacherEfficiency(C, B)).toBeGreaterThan(soloEfficiency(C) * 3);
    expect(teacherEfficiency(B, A)).toBeGreaterThan(soloEfficiency(B) * 10);
  });

  it('gets almost nothing from someone weaker', () => {
    expect(teacherEfficiency(C, D)).toBeCloseTo(soloEfficiency(C) * WEAKER_TEACHER_SCALE);
    expect(teacherEfficiency(C, E)).toBeLessThan(soloEfficiency(C));
  });

  it('applies a teacher only to the stats they are named for', () => {
    const stats = createStats(C);
    const grown = applyTraining(
      stats,
      { taijutsu: 1, intellect: 1 },
      { teachers: { taijutsu: B } },
    );
    const solo = trainingGain(C, 1);
    expect(grown.intellect - stats.intellect).toBeCloseTo(solo, 3);
    expect(grown.taijutsu - stats.taijutsu).toBeGreaterThan(solo * 3);
  });
});
