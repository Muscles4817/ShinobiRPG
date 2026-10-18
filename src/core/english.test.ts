import { counted, fillSlots, listed, numberWord, pronounForms, withArticle } from './english';

describe('pronouns', () => {
  it('gives every form, and the verb endings that agree', () => {
    expect(pronounForms('she')).toMatchObject({ they: 'she', them: 'her', their: 'her', s: 's' });
    expect(pronounForms('he')).toMatchObject({ them: 'him', themself: 'himself', is: 'is' });
    expect(pronounForms('they')).toMatchObject({ s: '', is: 'are', was: 'were', has: 'have' });
  });
});

describe('lists, articles and counts', () => {
  it('joins lists with commas and a last "and"', () => {
    expect(listed([])).toBe('');
    expect(listed(['a thug'])).toBe('a thug');
    expect(listed(['a thug', 'an archer'])).toBe('a thug and an archer');
    expect(listed(['a', 'b', 'c'])).toBe('a, b and c');
  });

  it('chooses the article by sound', () => {
    expect(withArticle('bandit')).toBe('a bandit');
    expect(withArticle('archer')).toBe('an archer');
    expect(withArticle('hour')).toBe('an hour');
    expect(withArticle('uniform')).toBe('a uniform');
  });

  it('counts in words, never numerals', () => {
    expect(counted(1, 'day')).toBe('a day');
    expect(counted(3, 'day')).toBe('three days');
    expect(counted(0, 'day')).toBe('no days');
    expect(counted(2, 'thief', 'thieves')).toBe('two thieves');
    expect(numberWord(40)).toBe('dozens of');
  });
});

describe('filling slots', () => {
  const values = {
    them: 'Asuka',
    'them.they': 'she',
    'them.their': 'her',
    'them.s': 's',
    place: 'the training ground',
  };

  it('fills names, forms and verb endings', () => {
    expect(fillSlots('{them} oils {them.their} blade.', values)).toBe('Asuka oils her blade.');
    expect(fillSlots('Then {them.they} say{them.s} it again.', values)).toBe(
      'Then she says it again.',
    );
  });

  it('capitalises a value that opens a sentence or a line of speech', () => {
    expect(fillSlots('{them.they} nods.', values)).toBe('She nods.');
    expect(fillSlots('“Go.” {them.they} leaves.', values)).toBe('“Go.” She leaves.');
    expect(fillSlots('“{place} is shut,” {them.they} says.', values)).toBe(
      '“The training ground is shut,” she says.',
    );
  });

  it('leaves slots it has no value for, for a later fill', () => {
    expect(fillSlots('{name} meets {them}.', { them: 'Goro' })).toBe('{name} meets Goro.');
  });
});
