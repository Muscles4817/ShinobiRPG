import {
  chakraLine,
  forceLine,
  harmLine,
  healLine,
  namedLine,
  numberedNames,
  reactionLine,
  splitNarration,
  squareUpLine,
  turnLine,
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

  it('says whose turn a line was written in, and where the fight stood', () => {
    const line = harmLine(turnLine('Goro hits Aoi.', 'goro#0', 'close'), 6);
    expect(splitNarration(line)).toEqual({
      text: 'Goro hits Aoi.',
      amounts: [{ kind: 'harm', amount: 6 }],
      reactions: [],
      actorId: 'goro#0',
      range: 'close',
    });
    expect(splitNarration(turnLine('Aoi waits.', 'player'))).toEqual({
      text: 'Aoi waits.',
      amounts: [],
      reactions: [],
      actorId: 'player',
    });
  });

  it('says how big a turn was, out of the sentence, and keeps the first size given', () => {
    const fire = { grade: 4, size: 'wide', element: 'fire' } as const;
    const line = forceLine(turnLine(harmLine('A wall of flame.', 30), 'goran'), fire);
    expect(splitNarration(line)).toMatchObject({ text: 'A wall of flame.', force: fire });
    const plain = { grade: 0, size: null, element: null };
    expect(splitNarration(forceLine('A punch.', plain)).force).toEqual(plain);
    expect(splitNarration(forceLine(line, plain)).force).toEqual(fire);
    expect(splitNarration('A punch.').force).toBeUndefined();
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

  it('tells fighters who share a name apart in the story by their place', () => {
    const ghost = { id: 'g', name: 'Hungry Ghost', called: 'the hungry ghost' };
    const called = numberedNames([ghost, { ...ghost, id: 'h' }]).map((f) => f.called);
    expect(called).toEqual(['the first hungry ghost', 'the second hungry ghost']);
  });

  it('carries the fighters a line names, in order, out of the sentence', () => {
    const line = turnLine(namedLine('You hit the thug.', ['player', 'thug#0']), 'player');
    expect(splitNarration(line)).toMatchObject({
      text: 'You hit the thug.',
      named: ['player', 'thug#0'],
    });
  });

  it('carries where fighters’ chakra stands out of the sentence', () => {
    const line = chakraLine(turnLine('You weave the seals.', 'player'), {
      player: 41.6,
      'enemy:zabuza': 120,
    });
    expect(splitNarration(line)).toMatchObject({
      text: 'You weave the seals.',
      actorId: 'player',
      chakra: { player: 42, 'enemy:zabuza': 120 },
    });
    expect(chakraLine('Nothing moved.', {})).toBe('Nothing moved.');
  });
});

describe('squareUpLine', () => {
  it('agrees with one foe or several', () => {
    const thug = { name: 'Bandit Thug', called: 'the bandit thug' };
    const archer = { name: 'Bandit Archer', called: 'the bandit archer' };
    expect(squareUpLine([{ name: 'Academy Dropout' }])).toBe('Academy Dropout squares up.');
    expect(squareUpLine([thug, archer])).toBe('The bandit thug and the bandit archer square up.');
    expect(squareUpLine([thug, thug, archer])).toBe(
      'Two bandit thugs and the bandit archer square up.',
    );
  });

  it('keeps the owner a line already has when a turn tags it', () => {
    const theirs = turnLine('Kai fires.', 'kai');
    expect(splitNarration(turnLine(theirs, 'aoi', 'mid'))).toMatchObject({
      actorId: 'kai',
      range: 'mid',
    });
  });
});
