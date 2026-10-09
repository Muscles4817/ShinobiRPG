import { createStats } from '@/systems/stats';

import { EMPTY_BOOK, learnBlocker, study, type TechniqueDef } from './techniques';

const fireball: TechniqueDef = {
  id: 'fireball',
  name: 'Fireball',
  description: '',
  discipline: 'ninjutsu',
  element: 'fire',
  effect: 'damage',
  chakraCost: 10,
  power: 15,
  requirements: { ninjutsu: 8 },
  difficulty: 30,
};

describe('techniques', () => {
  it('blocks learning when requirements are unmet', () => {
    expect(learnBlocker(EMPTY_BOOK, fireball, createStats(5), 'none')).toEqual({
      kind: 'requirements',
      unmet: ['ninjutsu'],
    });
    expect(learnBlocker(EMPTY_BOOK, fireball, createStats(8), 'none')).toBeNull();
  });

  it('accumulates progress then masters the technique', () => {
    const first = study(EMPTY_BOOK, fireball, 20);
    expect(first.mastered).toBe(false);
    expect(first.book.progress.fireball).toBe(20);

    const second = study(first.book, fireball, 20);
    expect(second.mastered).toBe(true);
    expect(second.book.known).toEqual(['fireball']);
    expect(second.book.progress.fireball).toBeUndefined();
  });

  it('restricts clan techniques to clan members', () => {
    const clanJutsu = { ...fireball, clan: 'uchiha' };
    expect(learnBlocker(EMPTY_BOOK, clanJutsu, createStats(10), 'none')).toEqual({
      kind: 'clan',
      clan: 'uchiha',
    });
    expect(learnBlocker(EMPTY_BOOK, clanJutsu, createStats(10), 'uchiha')).toBeNull();
  });

  it('blocks relearning a known technique', () => {
    const book = { known: ['fireball'], progress: {} };
    expect(learnBlocker(book, fireball, createStats(10), 'none')).toEqual({
      kind: 'already-known',
    });
  });
});
