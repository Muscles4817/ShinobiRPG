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
});
