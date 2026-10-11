import { harmLine, healLine, splitNarration } from './narration';

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
});
