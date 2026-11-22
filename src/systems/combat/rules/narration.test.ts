import {
  harmLine,
  healLine,
  namedLine,
  numberedNames,
  plainText,
  readLine,
  reactionLine,
  squareUpLine,
  toldFrom,
  voiceLine,
} from './narration';
import { causeLine } from './causes';
import { isLegacyStory, storyOfLines } from './narrationLegacy';

describe('fight narration', () => {
  it('keeps the amount out of the sentence', () => {
    expect(toldFrom(harmLine('Goro lands a blow on Aoi.', 7))).toEqual({
      kind: 'told',
      text: 'Goro lands a blow on Aoi.',
      amounts: [{ kind: 'harm', amount: 7 }],
    });
    expect(toldFrom(healLine('Aoi recovers.', 12))).toEqual({
      kind: 'told',
      text: 'Aoi recovers.',
      amounts: [{ kind: 'heal', amount: 12 }],
    });
  });

  it('tells a plain line as its words alone', () => {
    expect(toldFrom('Aoi strikes, but Shun slips aside.')).toEqual({
      kind: 'told',
      text: 'Aoi strikes, but Shun slips aside.',
    });
  });

  it('says which defences reacted, whose they were and whose attack they met', () => {
    const line = harmLine(
      reactionLine('Goro hits Aoi.', { by: 'aoi', on: 'goro' }, 'dodge-missed', 'guarded'),
      4,
    );
    expect(toldFrom(line)).toEqual({
      kind: 'told',
      text: 'Goro hits Aoi.',
      amounts: [{ kind: 'harm', amount: 4 }],
      reactions: [
        { reaction: 'dodge-missed', by: 'aoi', on: 'goro' },
        { reaction: 'guarded', by: 'aoi', on: 'goro' },
      ],
    });
    expect(toldFrom(reactionLine('Aoi slips past.', {}, 'dodged')).text).toBe('Aoi slips past.');
  });

  it('says why it went as it did, of whom, and what kind of thing it is', () => {
    expect(toldFrom(causeLine('Goro keeps pace.', 'kept-pace', 'aoi')).cause).toEqual({
      cause: 'kept-pace',
      kind: 'step-failed',
      subject: 'aoi',
    });
  });

  it('carries the fighters a line names, its words’ banks and a read, out of the sentence', () => {
    const line = readLine(voiceLine(namedLine('You hit the thug.', ['player', 'thug#0']), 'hit.2'));
    expect(toldFrom(line)).toEqual({
      kind: 'told',
      text: 'You hit the thug.',
      named: ['player', 'thug#0'],
      voices: ['hit.2'],
      read: true,
    });
    expect(plainText(line)).toBe('You hit the thug.');
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
});

describe('a story saved as lines', () => {
  const saved = [
    'Two bandits square up.',
    '— First exchange — ⟦rs⟧ ⟦pl:player=health:100,chakra:50|foe=health:80⟧ ⟦st:player=|foe=Dazed⟧',
    'You hit the bandit. ⟦n:player|foe⟧ ⟦r:guarded⟧ ⟦-12⟧ ⟦pl:foe=health:68⟧ ⟦by:player⟧ ⟦at:close⟧ ⟦fx:2:-:fire⟧',
    'You throw a plain blow. ⟦op:improvised⟧ ⟦c:read-it⟧ ⟦pl:player=chakra:41⟧ ⟦by:player⟧',
  ];

  it('is read into the events it told, so a fight saved mid-way still plays', () => {
    expect(isLegacyStory(saved)).toBe(true);
    expect(storyOfLines(saved)).toEqual([
      { kind: 'told', text: 'Two bandits square up.' },
      { kind: 'stand', who: 'player', pools: { health: 100, chakra: 50 }, statuses: [] },
      { kind: 'stand', who: 'foe', pools: { health: 80 }, statuses: [] },
      { kind: 'status', who: 'player', statuses: [] },
      { kind: 'status', who: 'foe', statuses: ['Dazed'] },
      { kind: 'told', text: '— First exchange —', divider: true, opensRound: true },
      { kind: 'health', who: 'foe', to: 68, cause: 'settled' },
      {
        kind: 'told',
        text: 'You hit the bandit.',
        named: ['player', 'foe'],
        amounts: [{ kind: 'harm', amount: 12 }],
        reactions: [{ reaction: 'guarded' }],
        actor: 'player',
        range: 'close',
        force: { grade: 2, size: null, element: 'fire' },
      },
      { kind: 'pools', who: 'player', to: { chakra: 41 } },
      {
        kind: 'told',
        text: 'You throw a plain blow.',
        cause: { cause: 'read-it', kind: 'slipped' },
        actor: 'player',
        offPlan: 'improvised',
      },
    ]);
  });

  it('has someone first seen mid-fight join it, not stand as the stretch opened', () => {
    const later = 'A clone bursts out. ⟦pl:clone=health:50⟧';
    expect(storyOfLines([...saved, later]).at(-2)).toEqual({
      kind: 'join',
      who: 'clone',
      pools: { health: 50 },
      statuses: [],
    });
  });

  it('is told apart from a story of events', () => {
    expect(isLegacyStory([{ kind: 'told', text: 'Hi.' }])).toBe(false);
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
});
