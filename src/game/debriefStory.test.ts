import type { LedgerLine } from '@/systems/missions';

import { debriefStory } from './debriefStory';

const line = (text: string, more: Partial<LedgerLine> = {}): LedgerLine => ({
  stageIndex: 0,
  text,
  tone: 'plain',
  ...more,
});

const paragraph = (lines: readonly LedgerLine[]) =>
  debriefStory(lines)
    .map((f) => f.text)
    .join('');

describe('the debrief as a paragraph', () => {
  it('tells a line as yours unless it is declared to name its own subject', () => {
    // Past tenses no rule of spelling finds: each is yours, and reads with a "you".
    const yours = ['Cut the snare.', 'Put the hound down.', 'Fed a lantern.', 'Outran a boat.'];
    for (const fact of yours) {
      expect(paragraph([line(fact)])).toBe(`You ${fact.charAt(0).toLowerCase()}${fact.slice(1)}`);
    }
    const own = line('Ned paid the toll.', { subject: 'its-own' });
    expect(paragraph([own])).toBe('Ned paid the toll.');
  });

  it('gives your facts a subject, runs a few together, and moves the story on', () => {
    const text = paragraph([
      line('The Watch asked for you by name.', { tone: 'gain', pay: 0.1, subject: 'its-own' }),
      line('Pulled a carter out of the ditch. It cost the light.'),
      line('Pushed on through the dark.'),
      line('Talked hungry men out of a robbery.'),
      line('Tried to keep your patience, and fell short.', { tone: 'cost', pay: -0.25 }),
    ]);
    expect(text).toBe(
      'The Watch asked for you by name. Then you pulled a carter out of the ditch. It cost the light.' +
        ' After that you pushed on through the dark and talked hungry men out of a robbery.' +
        ' In the end you tried to keep your patience, and fell short.',
    );
  });

  it('keeps each line’s pay beside its own words', () => {
    const told = debriefStory([
      line('Beat two bandit thugs.'),
      line('Paid them to go.', { tone: 'cost', pay: -0.2 }),
    ]);
    expect(told.map((f) => [f.text, f.pay])).toEqual([
      ['You beat two bandit thugs', null],
      [' and paid them to go.', '−20% pay'],
    ]);
  });

  it('never carries a numeral of its own', () => {
    const text = paragraph([line('Walked a lost child home.'), line('Soaked in a hot spring.')]);
    expect(text).not.toMatch(/\d/);
  });
});
