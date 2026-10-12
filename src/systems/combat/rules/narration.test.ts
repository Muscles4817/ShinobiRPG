import { harmLine, healLine, numberedNames, splitNarration } from './narration';

describe('fight narration', () => {
  it('keeps the amount out of the sentence', () => {
    expect(splitNarration(harmLine('Goro lands a blow on Aoi.', 7))).toEqual({
      text: 'Goro lands a blow on Aoi.',
      amounts: [{ kind: 'harm', amount: 7 }],
    });
    expect(splitNarration(healLine('Aoi recovers.', 12))).toEqual({
      text: 'Aoi recovers.',
      amounts: [{ kind: 'heal', amount: 12 }],
    });
  });

  it('passes plain lines (and older saves) through unchanged', () => {
    expect(splitNarration('Aoi strikes, but Shun slips aside.')).toEqual({
      text: 'Aoi strikes, but Shun slips aside.',
      amounts: [],
    });
  });

  it('numbers fighters who share a name, in the order they stand', () => {
    const names = numberedNames([
      { id: 'a', name: 'Aoi' },
      { id: 'g1', name: 'Hungry Ghost' },
      { id: 'b', name: 'Bandit' },
      { id: 'g2', name: 'Hungry Ghost' },
    ]).map((f) => f.name);
    expect(names).toEqual(['Aoi', 'Hungry Ghost 1', 'Bandit', 'Hungry Ghost 2']);
  });
});
