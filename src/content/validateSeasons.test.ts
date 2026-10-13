import { ORIGINAL_PACK } from './packs/original';
import { validateSeasons } from './validateSeasons';
import type { ContentPack } from './types';

const withFood = (id: string, patch: Partial<ContentPack['foods'][number]>): ContentPack => ({
  ...ORIGINAL_PACK,
  foods: ORIGINAL_PACK.foods.map((f) => (f.id === id ? { ...f, ...patch } : f)),
});

describe('seasonal food validation', () => {
  it('passes the shipped pack', () => {
    expect(validateSeasons(ORIGINAL_PACK)).toEqual([]);
  });

  it('rejects a dish that is never in season, or in season all year', () => {
    expect(validateSeasons(withFood('rice-ball', { seasons: [] }))).toContain(
      'food "rice-ball" must name each of its seasons once, and not all four',
    );
    const always = withFood('rice-ball', { seasons: ['Spring', 'Summer', 'Autumn', 'Winter'] });
    expect(validateSeasons(always)).toContain(
      'food "rice-ball" must name each of its seasons once, and not all four',
    );
  });

  it('rejects a stall left with nothing to sell for a whole season', () => {
    const problems = validateSeasons(withFood('soldier-pill', { seasons: ['Summer'] }));
    expect(problems).toContain('stall "Apothecary" has nothing to sell in Spring');
    expect(problems).not.toContain('stall "Apothecary" has nothing to sell in Summer');
  });
});
