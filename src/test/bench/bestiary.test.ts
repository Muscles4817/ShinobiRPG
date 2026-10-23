import { ORIGINAL_FOE_KIT } from '@/content/packs/original/bestiaryKit';
import { bestiary } from '@/content/shared/bestiary';
import { ctx } from '@/test/gameFixtures';

import { BEATEN_AT_LEAST, beatenAt, SCALE_BELOW, SCALE_OF, TOO_MUCH_BELOW } from './bestiaryFights';

/**
 * THE BESTIARY BENCH
 *
 * The shared bestiary is written before any job sends you after it, so nothing else would
 * notice a foe tuned wrong. Each one fights every bench archetype at the career scale its
 * danger means, and must be a fight there: beaten often, never a formality for every style.
 * A deadly or elite foe must also be too much for fighters a scale below, so its danger means
 * something. (Measured when the bestiary was written: the old foes of each danger sit inside
 * these bands, the samurai had to come down two steps to join them.)
 */

const SEEDS = 20;

const FOES = bestiary(ORIGINAL_FOE_KIT).map((e) => ctx.content.enemies.require(e.id));
/** A few thousand fights take a while on a slow runner. */
const TIMEOUT_MS = 30_000;

describe('the bestiary, each foe at the grade its danger means', () => {
  it.each(FOES.map((f) => [f.id, f] as const))(
    '%s is a fight at its own scale',
    (_, def) => {
      expect(beatenAt(def, SCALE_OF[def.danger], SEEDS)).toBeGreaterThanOrEqual(
        BEATEN_AT_LEAST[def.danger],
      );
    },
    TIMEOUT_MS,
  );

  it.each(FOES.filter((f) => SCALE_BELOW[f.danger] !== undefined).map((f) => [f.id, f] as const))(
    '%s is too much for fighters a scale below',
    (_, def) => {
      expect(beatenAt(def, SCALE_BELOW[def.danger]!, SEEDS)).toBeLessThanOrEqual(TOO_MUCH_BELOW);
    },
    TIMEOUT_MS,
  );
});
