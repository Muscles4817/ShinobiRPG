import { ORIGINAL_PACK } from './packs/original';
import { ledgerProblems } from './validateLedger';

describe('the ledger, apart from the story', () => {
  it('passes the original pack', () => {
    expect(ledgerProblems(ORIGINAL_PACK)).toEqual([]);
  });

  it('catches a ledger line that repeats the story, or tells it at length', () => {
    const [job] = ORIGINAL_PACK.missions;
    if (!job) throw new Error('no jobs');
    const told = 'You lose the trail in the rain and come home empty-handed.';
    const long =
      'You lose the trail in the rain and come home empty-handed after a long and miserable day of it.';
    const broken = {
      ...ORIGINAL_PACK,
      roadEvents: [],
      missions: [
        {
          ...job,
          stages: [
            { kind: 'narrative' as const, text: told },
            {
              kind: 'decision' as const,
              text: 'Which way?',
              options: [
                { label: 'Left', reply: 'Left it is.', ledger: told },
                { label: 'Right', reply: 'Right it is.', ledger: long },
              ],
            },
          ],
        },
      ],
    };
    const problems = ledgerProblems(broken);
    expect(problems.some((p) => p.includes('story’s own line'))).toBe(true);
    expect(problems.some((p) => p.includes('too long'))).toBe(true);
  });
});
