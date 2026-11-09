import { beatenAt, SCALE_BELOW, TOO_MUCH_BELOW } from './bestiaryFights';
import { FOREIGN_FOES, FOREIGN_SEEDS, FOREIGN_TIMEOUT_MS } from './foreignShinobi';

/** A foreign chūnin or jōnin, rogue or not, is too much for fighters a scale below. */
describe('foreign shinobi, against fighters a scale below', () => {
  it.each(
    FOREIGN_FOES.filter((f) => SCALE_BELOW[f.danger] !== undefined).map((f) => [f.id, f] as const),
  )(
    '%s is too much for fighters a scale below',
    (_, def) => {
      expect(beatenAt(def, SCALE_BELOW[def.danger]!, FOREIGN_SEEDS)).toBeLessThanOrEqual(
        TOO_MUCH_BELOW,
      );
    },
    FOREIGN_TIMEOUT_MS,
  );
});
