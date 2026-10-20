import type { TechniqueDef } from '@/systems/techniques';

import type { GearDef, PersonDef } from '../../../../types';
import { BLOODLINE_ARTS } from './bloodlineArts';
import { LEAF_PLANT_FIGHTERS } from './leafPlant';
import { REGIME_ARTS } from './regimeArts';
import { REGIME_FIGHTERS } from './regime';
import { RESISTANCE_FIGHTERS } from './resistance';
import { KIRI_BLADES, SWORD_ARTS } from './swordArts';
import { SWORDSMEN_FIGHTERS } from './swordsmen';
import { TAILED_ARTS } from './tailedArts';

/**
 * The Water Country's war, as fighters for versus: Yagura's regime and the loyal houses, the
 * Swordsmen, the bloodline resistance, and the Leaf's plant at its head. Joined inside
 * pure-annotated functions so a release build drops them with the fan pack.
 */
export const KIRI_FIGHTERS: readonly PersonDef[] = /*#__PURE__*/ (() => [
  ...REGIME_FIGHTERS,
  ...SWORDSMEN_FIGHTERS,
  ...LEAF_PLANT_FIGHTERS,
  ...RESISTANCE_FIGHTERS,
])();
export const KIRI_FIGHTER_ARTS: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...REGIME_ARTS,
  ...SWORD_ARTS,
  ...BLOODLINE_ARTS,
  ...TAILED_ARTS,
])();
export const KIRI_FIGHTER_GEAR: readonly GearDef[] = /*#__PURE__*/ (() => [...KIRI_BLADES])();
