import type { TechniqueDef } from '@/systems/techniques';

import type { GearDef, PersonDef } from '../../../../types';
import { CLOUD_ARTS } from './cloudArts';
import { CLOUD_GUARD } from './cloudGuard';
import { CLOUD_HOUSE } from './cloudHouse';
import { FAR_GEAR } from './gear';
import { SMALL_LAND_ARTS } from './smallLandArts';
import { SMALL_LAND_FIGHTERS } from './smallLands';
import { STONE_FIGHTERS } from './stone';
import { STONE_ARTS } from './stoneArts';

/**
 * The other great villages and the small ones, as fighters for versus: the Cloud, the Stone,
 * the Waterfall, the Rain and the samurai of Iron, each at home in a village that can't be
 * visited yet. Joined inside pure-annotated functions so a release build drops them with the
 * fan pack.
 */
export const FAR_FIGHTERS: readonly PersonDef[] = /*#__PURE__*/ (() => [
  ...CLOUD_HOUSE,
  ...CLOUD_GUARD,
  ...STONE_FIGHTERS,
  ...SMALL_LAND_FIGHTERS,
])();
export const FAR_FIGHTER_ARTS: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...CLOUD_ARTS,
  ...STONE_ARTS,
  ...SMALL_LAND_ARTS,
])();
export const FAR_FIGHTER_GEAR: readonly GearDef[] = /*#__PURE__*/ (() => [...FAR_GEAR])();
