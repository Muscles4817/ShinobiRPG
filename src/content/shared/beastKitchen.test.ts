import { CONTENT_PACKS } from '../packs';
import { BEAST_INGREDIENTS } from './beastKitchen';

/** What a chakra beast leaves comes out of the wild only with you: no stall sells it, no road gives it. */
describe('the beast kitchen', () => {
  it.each(CONTENT_PACKS.map((p) => [p.id, p] as const))(
    'in %s, no stall sells a beast ingredient and no road gives one',
    (_, pack) => {
      const stalls = [
        ...pack.locations.flatMap((l) =>
          l.places.flatMap((p) => (p.kind === 'market' ? p.stalls : [])),
        ),
        ...pack.village.festivals.flatMap((f) => f.stalls ?? []),
      ];
      const elsewhere = new Set([
        ...stalls.flatMap((s) => s.ingredientIds),
        ...pack.roadEvents.flatMap((e) => (e.kind === 'find' ? e.ingredientIds : [])),
      ]);
      expect(BEAST_INGREDIENTS.map((i) => i.id).filter((id) => elsewhere.has(id))).toEqual([]);
    },
  );
});
