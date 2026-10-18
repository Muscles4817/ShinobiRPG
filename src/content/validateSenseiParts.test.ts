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
