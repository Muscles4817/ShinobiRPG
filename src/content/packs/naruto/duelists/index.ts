import type { TechniqueDef } from '@/systems/techniques';

import type { PuppetDef } from '../../../puppets';
import type { GearDef, PersonDef } from '../../../types';
import { KIRI_FIGHTER_ARTS, KIRI_FIGHTER_GEAR, KIRI_FIGHTERS } from './kiri';
import { SUNA_FIGHTER_ARTS, SUNA_FIGHTER_GEAR, SUNA_FIGHTER_PUPPETS, SUNA_FIGHTERS } from './suna';
import { TENGEN, TENGEN_GEAR, TENGEN_TECHNIQUES } from './tengen';

/**
 * Authored fighters for versus mode who don't live in the world yet (`ContentPack.duelists`),
 * a file each with their own techniques and gear. Plumbing one in moves them to `people`.
 * Joined inside pure-annotated functions so a release build drops them with the fan pack.
 */
export const DUELISTS: readonly PersonDef[] = /*#__PURE__*/ (() => [
  TENGEN,
  ...SUNA_FIGHTERS,
  ...KIRI_FIGHTERS,
])();
export const DUELIST_TECHNIQUES: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...TENGEN_TECHNIQUES,
  ...SUNA_FIGHTER_ARTS,
  ...KIRI_FIGHTER_ARTS,
])();
export const DUELIST_GEAR: readonly GearDef[] = /*#__PURE__*/ (() => [
  ...TENGEN_GEAR,
  ...SUNA_FIGHTER_GEAR,
  ...KIRI_FIGHTER_GEAR,
])();
export const DUELIST_PUPPETS: readonly PuppetDef[] = /*#__PURE__*/ (() => [
  ...SUNA_FIGHTER_PUPPETS,
])();
