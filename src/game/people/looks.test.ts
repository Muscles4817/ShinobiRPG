import { DEFAULT_APPEARANCE } from '@/systems/profile';
import { ctx } from '@/test/gameFixtures';

import { personLook, playerLook } from './looks';

describe('how someone carries themselves', () => {
  const people = ctx.content.people.all;

  it('dresses seniors in a flak vest, genin in a jacket and villagers in a robe', () => {
    for (const person of people) {
      const dress = personLook(person).bearing?.dress;
      if (person.rank === 'civilian') expect(dress).toBe('robe');
      else if (person.rank === 'genin') expect(dress).toBe('jacket');
      else expect(dress).toBe('flak');
    }
  });

  it('gives everyone one character for their name tag', () => {
    for (const person of people) {
      expect(Array.from(personLook(person).bearing?.seal ?? '')).toHaveLength(1);
    }
  });

  it('wears the art they are known for', () => {
    const known = people.find((person) => person.specialty);
    expect(known && personLook(known).bearing?.art).toBe(known?.specialty);
  });

  it('changes what the player wears as they are promoted', () => {
    const you = { name: 'Ren', appearance: DEFAULT_APPEARANCE };
    expect(playerLook({ ...you, rank: 'genin' }).bearing?.dress).toBe('jacket');
    expect(playerLook({ ...you, rank: 'jonin' }).bearing?.dress).toBe('flak');
    expect(playerLook(you).bearing?.seal).toBe('れ');
  });
});
