import type { ContentPack } from '../types';
import { NARUTO_PACK } from './naruto';
import { ORIGINAL_PACK } from './original';

/**
 * Every content pack this build includes, default first.
 *
 * Fan packs (using names we don't own) are for personal play. A release build sets
 * VITE_EXCLUDE_FAN_PACKS=true; Vite replaces the flag at build time, so the fan pack's
 * module is tree-shaken out of the bundle entirely.
 */
const INCLUDE_FAN_PACKS = import.meta.env.VITE_EXCLUDE_FAN_PACKS !== 'true';

export const CONTENT_PACKS: readonly ContentPack[] = INCLUDE_FAN_PACKS
  ? [NARUTO_PACK, ORIGINAL_PACK]
  : [ORIGINAL_PACK];
