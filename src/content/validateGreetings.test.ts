import { ORIGINAL_PACK } from './packs/original';
import type { LocationDef } from './types';
import { validateContent } from './validate';

/** Towns' greetings: real villages held against, once each, and with words to say it. */

function withGreetings(greetings: LocationDef['greetings']) {
  const [first, ...rest] = ORIGINAL_PACK.locations;
  const town = { ...first!, ...(greetings ? { greetings } : {}) };
  return validateContent({ ...ORIGINAL_PACK, locations: [town, ...rest] });
}

describe('town greetings', () => {
  it('accepts a pack whose towns hold nothing against you', () => {
    expect(validateContent(ORIGINAL_PACK)).toEqual([]);
  });

  it('refuses a grudge against an unknown village, against itself, twice, or with no words', () => {
    const at = ORIGINAL_PACK.locations[0]!.id;
    const problems = withGreetings([
      { cause: { kind: 'from', locationId: 'atlantis' }, temper: 'cold', line: 'Go home.' },
      { cause: { kind: 'from', locationId: at }, temper: 'wary', line: 'Odd.' },
      { cause: { kind: 'contract' }, temper: 'wary', line: ' ' },
      { cause: { kind: 'contract' }, temper: 'cold', line: 'Again.' },
    ]);
    expect(problems).toEqual(
      expect.arrayContaining([
        `location "${at}" holds a grudge against unknown "atlantis"`,
        `location "${at}" holds a grudge against itself`,
        `location "${at}" has a greeting with no words`,
        `location "${at}" holds "contract" against you twice`,
      ]),
    );
  });

  it('opens shut gates only on a mark some job leaves, and says why they are shut', () => {
    const at = ORIGINAL_PACK.locations[0]!.id;
    const problems = withGreetings([
      {
        cause: { kind: 'contract' },
        temper: 'cold',
        line: 'Begone.',
        shut: { until: 'never-happens', refusal: ' ' },
      },
    ]);
    expect(problems).toEqual(
      expect.arrayContaining([
        `location "${at}" opens on "never-happens", which no job leaves behind`,
        `location "${at}" shuts its gates with no words`,
      ]),
    );
  });

  it('hunts on real roads with real foes, and asks questions a careful traveller can answer', () => {
    const at = ORIGINAL_PACK.locations[0]!.id;
    const careless = { label: 'Openly', tone: 'earnest' as const, reply: 'Seen.', heat: 3 };
    const problems = withGreetings([
      {
        cause: { kind: 'contract' },
        temper: 'cold',
        line: 'Begone.',
        hunt: {
          regions: ['the-moon'],
          hunterIds: ['nobody-at-all'],
          travel: { text: 'How?', answers: [careless] },
          sleep: { text: ' ', answers: [careless, { ...careless, heat: 1 }] },
          found: ' ',
        },
      },
    ]);
    expect(problems).toEqual(
      expect.arrayContaining([
        `location "${at}" hunts on region "the-moon", which has no road events`,
        `location "${at}" hunts with unknown foe "nobody-at-all"`,
        `location "${at}" offers one answer or none at its travel stop`,
        `location "${at}" has an answer at its travel stop that isn't 0 to 2 closer`,
        `location "${at}" has no careful answer at its sleep stop`,
        `location "${at}" asks nothing at its sleep stop`,
        `location "${at}" finds you with no words`,
      ]),
    );
  });
});
