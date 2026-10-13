import type { ExamDef } from '@/systems/exams';

import { ORIGINAL_PACK } from './packs/original';
import { validateExams } from './validateExams';

/** Exams fall on real days twice a year, with stages that make sense. */

const [EXAM] = ORIGINAL_PACK.exams;

function withExam(changes: Partial<ExamDef>) {
  return { ...ORIGINAL_PACK, exams: [{ ...EXAM!, ...changes }] };
}

describe('exam validation', () => {
  it('accepts the shipped exam', () => {
    expect(validateExams(ORIGINAL_PACK)).toEqual([]);
  });

  it('wants two real dates a year', () => {
    const once = validateExams(withExam({ dates: [{ season: 0, day: 1 }] }));
    expect(once).toContain('exam "lantern-trials" must fall on two dates a year');
    const never = validateExams(
      withExam({
        dates: [
          { season: 9, day: 1 },
          { season: 0, day: 40 },
        ],
      }),
    );
    expect(never).toContain('exam "lantern-trials" falls in a season that doesn’t exist');
    expect(never).toContain('exam "lantern-trials" falls on a day that doesn’t exist');
  });

  it('checks each stage', () => {
    const stages = EXAM!.stages.map((s) => {
      switch (s.kind) {
        case 'mind':
          return { ...s, passMark: 9 };
        case 'survival':
          return { ...s, missionId: 'lantern-patrol' };
        case 'tournament':
          return { ...s, rivals: [14, 11] };
      }
    });
    const problems = validateExams(withExam({ stages }));
    expect(problems).toContain('exam "lantern-trials" has a pass mark nobody can reach');
    expect(problems).toContain(
      'exam "lantern-trials" survival mission "lantern-patrol" must be an exam-only mission',
    );
    expect(problems).toContain('exam "lantern-trials" has rivals who get weaker round by round');
    expect(problems).toContain('exam-only mission "exam-ash-wood" is not run by any exam');
  });

  it('wants a chūnin exam and jobs for chūnin', () => {
    const bare = {
      ...ORIGINAL_PACK,
      exams: [],
      missions: ORIGINAL_PACK.missions.filter(
        (m) => m.rank !== 'B' && m.rank !== 'A' && !m.examOnly,
      ),
    };
    expect(validateExams(bare)).toEqual([
      'pack needs a chūnin exam',
      'pack needs jobs for chūnin (B- or A-rank)',
    ]);
  });
});
