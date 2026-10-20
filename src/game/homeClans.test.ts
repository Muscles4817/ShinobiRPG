import { contextForPack } from './context';
import { draftProblems } from './creation';
import { homeClans } from './homeClans';
import { yearClans } from './people/yearClans';
import { creationView } from './views/creation';
import { draft } from '@/test/gameFixtures';

/** Clans of another village live in their compounds there, and are never born into yours. */

const naruto = contextForPack('naruto')!;

describe('home clans', () => {
  it('keeps the Mist’s families out of the Leaf’s clans', () => {
    const ids = homeClans(naruto.content).map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(['none', 'uchiha', 'hyuga']));
    expect(ids).not.toContain('kasumi');
    expect(ids).not.toContain('yuki');
    expect(naruto.content.clans.get('kasumi')?.village).toBe('kirigakure');
  });

  it('never offers one at creation, nor takes a draft born into one', () => {
    const offered = creationView(naruto).clans.map((c) => c.id);
    expect(offered).not.toContain('hozuki');
    expect(draftProblems(draft({ clanId: 'hozuki' }, naruto), naruto)).toContain(
      'Choose your family.',
    );
  });

  it('never draws one into a year at the academy', () => {
    const away = new Set(
      naruto.content.clans.all.filter((c) => c.village === 'kirigakure').map((c) => c.id),
    );
    for (let seed = 1; seed <= 40; seed++) {
      expect(yearClans(naruto, seed, 27).some((id) => id !== null && away.has(id))).toBe(false);
    }
  });
});
