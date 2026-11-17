import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef } from '../../../../contracts';
import type { GearDef, PersonDef } from '../../../../types';
import { DEIDARA, DEIDARA_ARTS, EXPLOSIVE_CLAY } from './deidara';
import { ITACHI, ITACHI_ARTS } from './itachi';
import { KONAN, KONAN_ARTS } from './konan';
import { PAIN, PAIN_ARTS, SIX_PATHS } from './pain';
import { TOBI_ARTS, TOBI_FIGHTERS } from './tobi';
import { EARTH_GRUDGE, HIDAN_SCYTHE, ZOMBIE_ARTS, ZOMBIE_FIGHTERS } from './zombies';

/**
 * The Akatsuki, as fighters for versus: rogues of every village in the red-clouded cloak. Kisame
 * and Sasori stand with their own villages' fighters. Joined inside pure-annotated functions so
 * a release build drops them with the fan pack.
 */
export const AKATSUKI_FIGHTERS: readonly PersonDef[] = /*#__PURE__*/ (() => [
  ITACHI,
  ...ZOMBIE_FIGHTERS,
  DEIDARA,
  KONAN,
  PAIN,
  ...TOBI_FIGHTERS,
])();
export const AKATSUKI_ARTS: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...ITACHI_ARTS,
  ...ZOMBIE_ARTS,
  ...DEIDARA_ARTS,
  ...KONAN_ARTS,
  ...PAIN_ARTS,
  ...TOBI_ARTS,
])();
export const AKATSUKI_GEAR: readonly GearDef[] = /*#__PURE__*/ (() => [HIDAN_SCYTHE])();
/** Contracts only Akatsuki keep: no one signs them (`validateContracts.ts`). */
export const AKATSUKI_CONTRACTS: readonly ContractDef[] = /*#__PURE__*/ (() => [
  EARTH_GRUDGE,
  EXPLOSIVE_CLAY,
  SIX_PATHS,
])();
