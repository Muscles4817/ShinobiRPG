import { ORIGINAL_PACK } from './packs/original';
import type { ContentPack, PlaceDef } from './types';
import { validateCompanionArts } from './validateCompanionArts';

function withClinic(change: (place: PlaceDef) => PlaceDef): ContentPack {
  const locations = ORIGINAL_PACK.locations.map((l) => ({ ...l, places: l.places.map(change) }));
  return { ...ORIGINAL_PACK, locations };
}

describe('companion arts validation', () => {
  it('passes the shipped pack', () => {
    expect(validateCompanionArts(ORIGINAL_PACK)).toEqual([]);
  });

  it('needs a handler for every art only a handler teaches', () => {
    const pack = withClinic((p) =>
      p.kind === 'vet' && p.handling ? { ...p, handling: { ...p.handling, teaches: [] } } : p,
    );
    expect(validateCompanionArts(pack)).toContain(
      'companion kind "stray-hound" needs a handler to teach "baying-howl", and none does',
    );
  });

  it('reports lore sold nowhere and handling no better than your own', () => {
    const pack = withClinic((p) => {
      if (p.kind === 'gear') return { ...p, loreIds: [] };
      return p.kind === 'vet' && p.handling ? { ...p, handling: { ...p.handling, quality: 1 } } : p;
    });
    const problems = validateCompanionArts(pack);
    expect(problems).toContain('lore "kennel-masters-notes" is sold nowhere');
    expect(problems).toContain('vet "animal-clinic" handles no better than an owner');
  });
});
