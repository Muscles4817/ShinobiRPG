import { splitNarration } from './narration';
import { tell } from './telling';

const you = { id: 'player', name: 'Kaito', called: 'you', grammar: 'you' } as const;
const goran = { id: 'goran', name: 'Gōran', grammar: 'he' } as const;
const wraith = {
  id: 'wraith#0',
  name: 'Storehouse Wraith',
  called: 'the storehouse wraith',
  grammar: 'it',
} as const;
const asuka = { id: 'asuka', name: 'Asuka', grammar: 'they' } as const;

const text = (line: string) => splitNarration(line).text;

describe('telling a fight', () => {
  it('speaks to the player as you, and agrees the verb', () => {
    const line = '{a} search{a.es} the field and find{a.s} no one.';
    expect(text(tell(line, { a: you }))).toBe('You search the field and find no one.');
    expect(text(tell(line, { a: goran }))).toBe('Gōran searches the field and finds no one.');
  });

  it('gives a name a singular verb whatever the pronouns, and the pronouns their own forms', () => {
    const line = '{a} shake{a.s} {a.their} head.';
    expect(text(tell(line, { a: asuka }))).toBe('Asuka shakes their head.');
    expect(text(tell(line, { a: wraith }))).toBe('The storehouse wraith shakes its head.');
    expect(text(tell(line, { a: you }))).toBe('You shake your head.');
  });

  it('owns things in the right words, and capitalises a slot that opens a sentence', () => {
    const line = '{a.poss} strike hits {t}.';
    expect(text(tell(line, { a: wraith, t: you }))).toBe(
      'The storehouse wraith’s strike hits you.',
    );
    expect(text(tell(line, { a: you, t: wraith }))).toBe('Your strike hits the storehouse wraith.');
  });

  it('joins several fighters into one subject', () => {
    const line = '{found} can’t hide from {a.them}.';
    const told = tell(line, { found: [wraith, goran], a: you });
    expect(text(told)).toBe('The storehouse wraith and Gōran can’t hide from you.');
  });

  it('marks whom the line named, in the order it named them', () => {
    const told = tell('{a.poss} strike hits {t}.', { t: wraith, a: you });
    expect(splitNarration(told).named).toEqual(['player', 'wraith#0']);
  });

  it('falls back to the name and "they" for a fighter set up before the story knew them', () => {
    const old = { id: 'bandit', name: 'Bandit' };
    expect(text(tell('{a} reel{a.s} from the blow.', { a: old }))).toBe(
      'Bandit reels from the blow.',
    );
  });
});
