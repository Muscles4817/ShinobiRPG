import type { DecisionOption } from '@/systems/missions';

import { ORIGINAL_PACK } from './packs/original';
import { ledgerProblems, opensOnSomeoneElse } from './validateLedger';

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

  it('wants a line that opens on someone else to say so', () => {
    const [job] = ORIGINAL_PACK.missions;
    if (!job) throw new Error('no jobs');
    const deciding = (options: DecisionOption[]) => ({
      ...ORIGINAL_PACK,
      roadEvents: [],
      missions: [{ ...job, stages: [{ kind: 'decision' as const, text: 'Which way?', options }] }],
    });
    const asYours = { label: 'Wait', reply: 'You wait.', ledger: 'The client asked for you.' };
    expect(ledgerProblems(deciding([asYours])).some((p) => p.includes('as yours'))).toBe(true);
    const declared = { ...asYours, ledgerSubject: 'its-own' as const };
    expect(ledgerProblems(deciding([declared]))).toEqual([]);
    const lonely = { label: 'Go', reply: 'You go.', ledgerSubject: 'its-own' as const };
    expect(ledgerProblems(deciding([lonely])).some((p) => p.includes('no line'))).toBe(true);
    expect(opensOnSomeoneElse('{foe} died in the rain.', new Set())).toBe(true);
    expect(opensOnSomeoneElse('Cut the snare.', new Set(['Ochō']))).toBe(false);
    expect(opensOnSomeoneElse('Ochō went home.', new Set(['Ochō']))).toBe(true);
  });
});
