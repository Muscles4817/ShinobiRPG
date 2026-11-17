import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef } from '../../../../contracts';
import type { GearDef, PersonDef } from '../../../../types';
import { MEDIC_ARTS, SLUGS } from './medicArts';
import { MEDIC_FIGHTERS } from './medics';

/**
 * The Leaf's own who aren't in the world yet, as fighters for versus: Hokage past and present,
 * their families and students, Root, and the Uchiha. Joined inside pure-annotated functions so
 * a release build drops them with the fan pack.
 */
export const LEAF_FIGHTERS: readonly PersonDef[] = /*#__PURE__*/ (() => [...MEDIC_FIGHTERS])();
export const LEAF_ARTS: readonly TechniqueDef[] = /*#__PURE__*/ (() => [...MEDIC_ARTS])();
export const LEAF_GEAR: readonly GearDef[] = /*#__PURE__*/ (() => [])();
export const LEAF_CONTRACTS: readonly ContractDef[] = /*#__PURE__*/ (() => [SLUGS])();
