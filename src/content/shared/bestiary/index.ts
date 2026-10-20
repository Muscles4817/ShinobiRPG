import type { EnemyDef } from '../../types';
import { DESERT_BEASTS } from './desert';
import type { FoeKit } from './kit';
import { bandits, smugglersAndSellswords } from './outlaws';
import { archersAndMonks, samurai } from './warriors';
import { restlessDead, seaRaiders, WILD_BEASTS } from './wild';

/**
 * The bestiary every pack shares: foes written before any job needs them, by the kind of
 * country and trade they belong to (road, coast, mountain, marsh, desert, a lord's household), not by
 * the towns there are today, so a job written or generated anywhere that fits can use them.
 * A bench test fights each one at the grade its danger means (`src/test/bench/bestiary.test.ts`).
 */

export { FOE_ROLES, type FoeKit, type FoeRole } from './kit';

/*#__NO_SIDE_EFFECTS__*/
export function bestiary(kit: FoeKit): EnemyDef[] {
  return [
    ...bandits(kit),
    ...smugglersAndSellswords(kit),
    ...samurai(kit),
    ...archersAndMonks(kit),
    ...seaRaiders(kit),
    ...restlessDead(kit),
    ...WILD_BEASTS,
    ...DESERT_BEASTS,
  ];
}
