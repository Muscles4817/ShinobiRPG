import type { LedgerLine } from '@/systems/missions';

import { debriefStory, subjectless } from './debriefStory';

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
  it('knows a line that opens on its verb from one with a subject', () => {
    expect(subjectless('Pulled a carter out of the ditch.')).toBe(true);
    expect(subjectless('Kept faith with the ferrymen.')).toBe(true);
    expect(subjectless('Freed the dog.')).toBe(true);
    expect(subjectless('The client asked for you by name.')).toBe(false);
    expect(subjectless('Old Saburō bolted.')).toBe(false);
    expect(subjectless('Ned paid the toll.')).toBe(false);
  });

  it('gives your facts a subject, runs a few together, and moves the story on', () => {
    const text = paragraph([
      line('The Watch asked for you by name.', { tone: 'gain', pay: 0.1 }),
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
      line('Beat two thugs in a fight.'),
      line('Paid them to go.', { tone: 'cost', pay: -0.2 }),
    ]);
    expect(told.map((f) => [f.text, f.pay])).toEqual([
      ['You beat two thugs in a fight', null],
      [' and paid them to go.', '−20% pay'],
    ]);
  });

  it('never carries a numeral of its own', () => {
    const text = paragraph([line('Walked a lost child home.'), line('Soaked in a hot spring.')]);
    expect(text).not.toMatch(/\d/);
  });
});
