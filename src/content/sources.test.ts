import { ORIGINAL_PACK } from './packs/original';
import type { ContentPack, PlaceDef } from './types';
import { validateContent } from './validate';

/** Where techniques come from: shelves by rank, clan arts in the clan, and a source for each. */

function withPlaces(pack: ContentPack, change: (place: PlaceDef) => PlaceDef): ContentPack {
  const [start, ...rest] = pack.locations;
  return { ...pack, locations: [{ ...start!, places: start!.places.map(change) }, ...rest] };
}

function shelve(kind: 'academy' | 'library', id: string): (place: PlaceDef) => PlaceDef {
  return (p) => (p.kind === kind ? { ...p, techniqueIds: [...p.techniqueIds, id] } : p);
}

describe('technique sources', () => {
  it('keeps the academy to rank E–D and the library to C–A', () => {
    const academy = validateContent(withPlaces(ORIGINAL_PACK, shelve('academy', 'tide-lash')));
    expect(academy).toContain('academy "academy" holds "tide-lash" of rank C (E–D only)');
    const library = validateContent(withPlaces(ORIGINAL_PACK, shelve('library', 'ember-breath')));
    expect(library).toContain(
      'library "lantern-archive" holds "ember-breath" of rank D (C–A only)',
    );
    const forbidden = validateContent(
      withPlaces(ORIGINAL_PACK, shelve('library', 'old-lamp-dawn')),
    );
    expect(forbidden).toContain(
      'library "lantern-archive" holds "old-lamp-dawn" of rank S (C–A only)',
    );
  });

  it('keeps clan techniques off the shelves and in the clan', () => {
    const shelved = validateContent(withPlaces(ORIGINAL_PACK, shelve('academy', 'forge-cut')));
    expect(shelved).toContain('academy "academy" lists clan technique "forge-cut"');
    const people = ORIGINAL_PACK.people.map((p) =>
      p.id === 'goran' && p.teacher
        ? { ...p, teacher: { ...p.teacher, teaches: [...p.teacher.teaches, 'forge-cut'] } }
        : p,
    );
    expect(validateContent({ ...ORIGINAL_PACK, people })).toContain(
      'teacher "goran" teaches "forge-cut" but isn’t of the kurogane clan',
    );
  });

  it('needs every technique to be learnable somewhere', () => {
    const lost = { ...ORIGINAL_PACK.techniques[0]!, id: 'lost-art' };
    const pack = { ...ORIGINAL_PACK, techniques: [...ORIGINAL_PACK.techniques, lost] };
    expect(validateContent(pack)).toContain(
      'technique "lost-art" can\'t be learned anywhere (no shelf, teacher or scroll)',
    );
  });

  it('checks what missions hand over', () => {
    const missions = ORIGINAL_PACK.missions.map((m, i) =>
      i === 0 ? { ...m, reward: { ...m.reward, scrollId: 'nothing', gearId: 'nowhere' } } : m,
    );
    const id = ORIGINAL_PACK.missions[0]!.id;
    const problems = validateContent({ ...ORIGINAL_PACK, missions });
    expect(problems).toContain(`mission "${id}" rewards a scroll of unknown technique "nothing"`);
    expect(problems).toContain(`mission "${id}" rewards unknown gear "nowhere"`);
  });
});
