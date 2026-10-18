import type { TechniqueDef } from '@/systems/techniques';

import type { GearDef, PersonDef } from '../../../types';
import { TENGEN, TENGEN_GEAR, TENGEN_TECHNIQUES } from './tengen';

/**
 * Authored fighters for versus mode who don't live in the world yet (`ContentPack.duelists`),
 * a file each with their own techniques and gear. Plumbing one in moves them to `people`.
 * Joined inside pure-annotated functions so a release build drops them with the fan pack.
 */
export const DUELISTS: readonly PersonDef[] = /*#__PURE__*/ (() => [TENGEN])();
export const DUELIST_TECHNIQUES: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...TENGEN_TECHNIQUES,
])();
export const DUELIST_GEAR: readonly GearDef[] = /*#__PURE__*/ (() => [...TENGEN_GEAR])();
