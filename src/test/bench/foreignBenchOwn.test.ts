import { BEATEN_AT_LEAST, beatenAt, SCALE_OF } from './bestiaryFights';
import { FOREIGN_FOES, FOREIGN_SEEDS, FOREIGN_TIMEOUT_MS } from './foreignShinobi';

/** Every foreign shinobi and missing-nin is a fight at the scale its grade means. */
describe('foreign shinobi, each at its own scale', () => {
  it.each(FOREIGN_FOES.map((f) => [f.id, f] as const))(
    '%s is a fight at its own scale',
    (_, def) => {
      expect(beatenAt(def, SCALE_OF[def.danger], FOREIGN_SEEDS)).toBeGreaterThanOrEqual(
        BEATEN_AT_LEAST[def.danger],
      );
    },
    FOREIGN_TIMEOUT_MS,
  );
});
