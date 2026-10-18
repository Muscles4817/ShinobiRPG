import { contextForPack } from '@/game';
import { ctx, newGame } from '@/test/gameFixtures';

import { findPerson } from './cast';
import { personSlots, pronounsOf, rolledPronouns } from './pronouns';
import { fillLine } from './talk';

describe('pronouns', () => {
  it('reads an authored person’s own', () => {
    const goran = ctx.content.people.require('goran');
    expect(pronounsOf(goran)).toBe('he');
    expect(personSlots('them', goran)).toMatchObject({ them: 'Gōran', 'them.their': 'his' });
  });

  it('gives generated classmates theirs when they are made, mixed across the year', () => {
    const s = newGame();
    const year = s.people.generated;
    expect(year.every((p) => p.pronouns !== undefined)).toBe(true);
    expect(new Set(year.map((p) => p.pronouns)).size).toBeGreaterThan(1);
    const mate = findPerson(s, ctx, s.people.team?.teammateIds[0] ?? '');
    expect(mate?.pronouns).toBeDefined();
  });

  it('reads a person from an older save the same way every time', () => {
    expect(pronounsOf({ id: 'gen-3' })).toBe(rolledPronouns('gen-3'));
    expect(pronounsOf({ id: 'gen-3' })).toBe(pronounsOf({ id: 'gen-3' }));
  });

  it('gives every composed sensei pronouns', () => {
    const naruto = contextForPack('naruto');
    for (const c of [ctx, ...(naruto ? [naruto] : [])]) {
      const pooled = c.content.people.all.filter((p) => p.sensei?.pooled);
      expect(pooled.length).toBeGreaterThan(0);
      expect(pooled.every((p) => p.pronouns)).toBe(true);
    }
  });

  it('fills a topic’s words that speak of the person too', () => {
    const goran = ctx.content.people.require('goran');
    const values = { story: '{them.they} broke {them.their} arm', ...personSlots('them', goran) };
    expect(fillLine('“{story},” says {them}.', values)).toBe('“He broke his arm,” says Gōran.');
  });
});
