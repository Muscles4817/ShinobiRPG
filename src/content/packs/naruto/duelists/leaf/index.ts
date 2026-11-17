import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef } from '../../../../contracts';
import type { GearDef, PersonDef } from '../../../../types';
import { FOURTH_FIGHTERS } from './fourth';
import { FOURTH_ARTS, FOURTH_GEAR } from './fourthArts';
import { MEDIC_ARTS, SLUGS } from './medicArts';
import { MEDIC_FIGHTERS } from './medics';
import { SENJU_ARTS } from './senjuArts';
import { SENJU_FIGHTERS } from './senju';
import { THUNDER_GOD_ARTS, THUNDER_GOD_GEAR } from './thunderGod';

/**
 * The Leaf's own who aren't in the world yet, as fighters for versus: Hokage past and present,
 * their families and students, Root, and the Uchiha. Joined inside pure-annotated functions so
 * a release build drops them with the fan pack.
 */
export const LEAF_FIGHTERS: readonly PersonDef[] = /*#__PURE__*/ (() => [
  ...MEDIC_FIGHTERS,
  ...SENJU_FIGHTERS,
  ...FOURTH_FIGHTERS,
])();
export const LEAF_ARTS: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...MEDIC_ARTS,
  ...SENJU_ARTS,
  ...THUNDER_GOD_ARTS,
  ...FOURTH_ARTS,
])();
export const LEAF_GEAR: readonly GearDef[] = /*#__PURE__*/ (() => [
  ...THUNDER_GOD_GEAR,
  ...FOURTH_GEAR,
])();
export const LEAF_CONTRACTS: readonly ContractDef[] = /*#__PURE__*/ (() => [SLUGS])();
