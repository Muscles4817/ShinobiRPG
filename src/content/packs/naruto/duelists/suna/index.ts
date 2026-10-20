import type { TechniqueDef } from '@/systems/techniques';

import type { PuppetDef } from '../../../../puppets';
import type { GearDef, PersonDef } from '../../../../types';
import { WIND_FIGHTERS } from './cuttingWind';
import { GAARA, RASA, SUNA_DUST_TECHNIQUES, THIRD_KAZEKAGE } from './dust';
import { DUNE_FIGHTERS } from './dunes';
import { HOUSE_FIGHTERS } from './house';
import { PUPPET_ARTS, SUNA_PUPPETS } from './puppetArts';
import { RED_SAND_FIGHTERS } from './redSand';
import { SAND_ARTS } from './sandArts';
import { VILLAGE_FIGHTERS } from './village';
import { SUNA_FANS, WIND_ARTS } from './windArts';

/**
 * The Sand, as fighters for versus (`docs/design/sunagakure-plan.md`): the Kazekage's house,
 * the Red Sand's puppeteers, the Cutting Wind's fans, the Dunes' sand priests and the village's
 * own. Joined inside pure-annotated functions so a release build drops them with the fan pack.
 */
export const SUNA_FIGHTERS: readonly PersonDef[] = /*#__PURE__*/ (() => [
  GAARA,
  RASA,
  THIRD_KAZEKAGE,
  ...HOUSE_FIGHTERS,
  ...RED_SAND_FIGHTERS,
  ...WIND_FIGHTERS,
  ...DUNE_FIGHTERS,
  ...VILLAGE_FIGHTERS,
])();
export const SUNA_FIGHTER_ARTS: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...SUNA_DUST_TECHNIQUES,
  ...PUPPET_ARTS,
  ...WIND_ARTS,
  ...SAND_ARTS,
])();
export const SUNA_FIGHTER_GEAR: readonly GearDef[] = /*#__PURE__*/ (() => [...SUNA_FANS])();
export const SUNA_FIGHTER_PUPPETS: readonly PuppetDef[] = /*#__PURE__*/ (() => [...SUNA_PUPPETS])();
