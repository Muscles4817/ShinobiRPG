import type { TechniqueDef } from '@/systems/techniques';

import type { PuppetDef } from '../../../puppets';
import type { GearDef, PersonDef } from '../../../types';
import { AKATSUKI_ARTS, AKATSUKI_FIGHTERS, AKATSUKI_GEAR } from './akatsuki';
import { KIRI_FIGHTER_ARTS, KIRI_FIGHTER_GEAR, KIRI_FIGHTERS } from './kiri';
import { FAR_FIGHTER_ARTS, FAR_FIGHTER_GEAR, FAR_FIGHTERS } from './lands';
import { SUNA_FIGHTER_ARTS, SUNA_FIGHTER_GEAR, SUNA_FIGHTER_PUPPETS, SUNA_FIGHTERS } from './suna';
import { SOUND_ARTS, SOUND_FIGHTERS } from './sound';
import { JIRAIYA, JIRAIYA_TECHNIQUES } from './jiraiya';
import { TENGEN, TENGEN_GEAR, TENGEN_TECHNIQUES } from './tengen';
import { OROCHIMARU, OROCHIMARU_TECHNIQUES } from './orochimaru';
import { LEAF_ARTS, LEAF_FIGHTERS, LEAF_GEAR } from './leaf';

/**
 * Authored fighters for versus mode who don't live in the world yet (`ContentPack.duelists`),
 * a file each with their own techniques and gear. Plumbing one in moves them to `people`.
 * Joined inside pure-annotated functions so a release build drops them with the fan pack.
 */
export const DUELISTS: readonly PersonDef[] = /*#__PURE__*/ (() => [
  TENGEN,
  JIRAIYA,
  OROCHIMARU,
  ...SUNA_FIGHTERS,
  ...KIRI_FIGHTERS,
  ...LEAF_FIGHTERS,
  ...SOUND_FIGHTERS,
  ...AKATSUKI_FIGHTERS,
  ...FAR_FIGHTERS,
])();
export const DUELIST_TECHNIQUES: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...TENGEN_TECHNIQUES,
  ...JIRAIYA_TECHNIQUES,
  ...OROCHIMARU_TECHNIQUES,
  ...SUNA_FIGHTER_ARTS,
  ...KIRI_FIGHTER_ARTS,
  ...LEAF_ARTS,
  ...SOUND_ARTS,
  ...AKATSUKI_ARTS,
  ...FAR_FIGHTER_ARTS,
])();
export const DUELIST_GEAR: readonly GearDef[] = /*#__PURE__*/ (() => [
  ...TENGEN_GEAR,
  ...SUNA_FIGHTER_GEAR,
  ...KIRI_FIGHTER_GEAR,
  ...LEAF_GEAR,
  ...AKATSUKI_GEAR,
  ...FAR_FIGHTER_GEAR,
])();
export const DUELIST_PUPPETS: readonly PuppetDef[] = /*#__PURE__*/ (() => [
  ...SUNA_FIGHTER_PUPPETS,
])();
