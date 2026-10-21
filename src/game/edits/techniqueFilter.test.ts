import {
  browseTechniques,
  OPEN_TECHNIQUE_FILTER,
  TECHNIQUE_PAGE_SIZE,
  type TechniqueFilter,
} from './techniqueFilter';
import type { EditorTechnique } from './view';

/** Finding a technique: facets, counts that never lead nowhere, and pages. */

function technique(id: string, over: Partial<EditorTechnique> = {}): EditorTechnique {
  return {
    id,
    name: id,
    discipline: 'ninjutsu',
    rank: 'D',
    element: null,
    kinds: ['projectile'],
    ready: true,
    ...over,
  };
}

const LIST: readonly EditorTechnique[] = [
  technique('Fireball', { element: 'fire', rank: 'C' }),
  technique('Water Bullet', { element: 'water' }),
  technique('Iai Cut', { discipline: 'kenjutsu', kinds: ['blade'], ready: false }),
  technique('Leaf Whirlwind', { discipline: 'taijutsu', kinds: ['body', 'movement'] }),
];

const browse = (filter: Partial<TechniqueFilter>, page = 0) =>
  browseTechniques(LIST, { ...OPEN_TECHNIQUE_FILTER, ...filter }, page);

describe('browsing techniques to add', () => {
  it('shows everything on an open filter, unfiltered', () => {
    const all = browse({});
    expect(all.found).toBe(LIST.length);
    expect(all.filtered).toBe(false);
  });

  it('narrows by art, rank, element, kind, name and readiness together', () => {
    expect(browse({ element: 'fire' }).shown.map((t) => t.id)).toEqual(['Fireball']);
    expect(browse({ element: 'none' }).shown).toHaveLength(2);
    expect(browse({ kind: 'movement' }).shown.map((t) => t.id)).toEqual(['Leaf Whirlwind']);
    expect(browse({ art: 'ninjutsu', rank: 'D' }).shown.map((t) => t.id)).toEqual(['Water Bullet']);
    expect(browse({ query: 'iai' }).found).toBe(1);
    expect(browse({ readyOnly: true }).found).toBe(3);
    expect(browse({ kind: 'blade' }).filtered).toBe(true);
  });

  it('counts each facet against the other filters, and offers no empty choice', () => {
    const fire = browse({ element: 'fire' });
    expect(fire.elements.map((o) => o.value)).toEqual(['fire', 'water', 'none']);
    expect(fire.arts).toEqual([{ value: 'ninjutsu', label: 'Ninjutsu', count: 1 }]);
    expect(fire.kinds.every((o) => o.count > 0)).toBe(true);
  });

  it('pages a long list and keeps the page in range', () => {
    const many = Array.from({ length: TECHNIQUE_PAGE_SIZE * 2 + 3 }, (_, i) => technique(`t${i}`));
    const last = browseTechniques(many, OPEN_TECHNIQUE_FILTER, 99);
    expect(last.pages).toBe(3);
    expect(last.page).toBe(2);
    expect(last.shown).toHaveLength(3);
    expect(browseTechniques([], OPEN_TECHNIQUE_FILTER, 0).pages).toBe(1);
  });
});
