import {
  harmLine,
  healLine,
  numberedNames,
  reactionLine,
  splitNarration,
  squareUpLine,
} from './narration';

describe('fight narration', () => {
  it('keeps the amount out of the sentence', () => {
    expect(splitNarration(harmLine('Goro lands a blow on Aoi.', 7))).toEqual({
      text: 'Goro lands a blow on Aoi.',
      amounts: [{ kind: 'harm', amount: 7 }],
      reactions: [],
    });
    expect(splitNarration(healLine('Aoi recovers.', 12))).toEqual({
      text: 'Aoi recovers.',
      amounts: [{ kind: 'heal', amount: 12 }],
      reactions: [],
    });
  });

  it('passes plain lines (and older saves) through unchanged', () => {
    expect(splitNarration('Aoi strikes, but Shun slips aside.')).toEqual({
      text: 'Aoi strikes, but Shun slips aside.',
      amounts: [],
      reactions: [],
    });
  });

  it('keeps the defences that reacted out of the sentence', () => {
    const line = harmLine(reactionLine('Goro hits Aoi.', 'dodge-missed', 'guarded'), 4);
    expect(splitNarration(line)).toEqual({
      text: 'Goro hits Aoi.',
      amounts: [{ kind: 'harm', amount: 4 }],
      reactions: ['dodge-missed', 'guarded'],
    });
    expect(splitNarration(reactionLine('Aoi slips past.', 'dodged')).text).toBe('Aoi slips past.');
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

describe('squareUpLine', () => {
  it('agrees with one foe or several', () => {
    expect(squareUpLine(['Academy Dropout'])).toBe('Academy Dropout squares up.');
    expect(squareUpLine(['Bandit Thug', 'Bandit Archer'])).toBe(
      'Bandit Thug, Bandit Archer square up.',
    );
  });
});
