import { ORIGINAL_PACK } from './packs/original';
import { validateSenseiParts } from './validateSenseiParts';

/** A past's lines may name its people with every pronoun form, and nothing else. */

function withWound(wound: string): typeof ORIGINAL_PACK {
  const [first, ...rest] = ORIGINAL_PACK.senseiParts.pasts;
  const pasts = [{ ...first!, wound }, ...rest];
  return { ...ORIGINAL_PACK, senseiParts: { ...ORIGINAL_PACK.senseiParts, pasts } };
}

describe('the slots of a sensei past', () => {
  it('accept the pronoun forms of the people in it', () => {
    const wound =
      "{name.they} keep{name.s} {lost.their} {keepsake}; {foe.they}{foe.'s} at {place}.";
    expect(validateSenseiParts(withWound(wound))).toEqual([]);
  });

  it('refuse a form that is not one, or a form of something that is not a person', () => {
    const problems = validateSenseiParts(withWound('{name.thy} at {place.they}'));
    expect(problems).toEqual([
      expect.stringContaining('uses an unknown slot {name.thy}'),
      expect.stringContaining('uses an unknown slot {place.they}'),
    ]);
  });
});

describe('the ledger of a sensei past', () => {
  it('refuses speech, a long line, the place or a line without a full stop', () => {
    const [first, ...rest] = ORIGINAL_PACK.senseiParts.pasts;
    const ledger = {
      ...first!.arc.ledger,
      mercy: '“Bring them home,” you said.',
      spared:
        'Brought {lost} home after a long road with many turns and many stops along the way there.',
      ended: 'Ended it at {place}',
    };
    const pasts = [{ ...first!, arc: { ...first!.arc, ledger } }, ...rest];
    const pack = { ...ORIGINAL_PACK, senseiParts: { ...ORIGINAL_PACK.senseiParts, pasts } };
    expect(validateSenseiParts(pack)).toEqual([
      expect.stringContaining('quotes speech in its ledger: mercy'),
      expect.stringContaining('ledger line too long: spared'),
      expect.stringContaining('names the place in its ledger: ended'),
      expect.stringContaining('without a full stop: ended'),
    ]);
  });
});
