import { CONTENT_PACKS } from '../packs';
import { BEAST_INGREDIENTS } from './beastKitchen';

/** The meat of a chakra beast only comes out of the wild with you. */
describe('the beast kitchen', () => {
  it.each(CONTENT_PACKS.map((p) => [p.id, p] as const))(
    'in %s, every beast ingredient is dropped by a chakra beast and sold nowhere',
    (_, pack) => {
      const dropped = new Set(
        pack.enemies.filter((e) => e.chakraBeast).flatMap((e) => e.drops ?? []),
      );
      const sold = new Set(
        pack.locations.flatMap((l) =>
          l.places.flatMap((p) =>
            p.kind === 'market' ? p.stalls.flatMap((s) => s.ingredientIds) : [],
          ),
        ),
      );
      for (const { id } of BEAST_INGREDIENTS) {
        expect(dropped.has(id), id).toBe(true);
        expect(sold.has(id), id).toBe(false);
      }
    },
  );
});
