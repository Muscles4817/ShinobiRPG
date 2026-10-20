import type { TechniqueDef } from '@/systems/techniques';

import { LEAF_CAST_ARMOUR } from './armour';
import { LEAF_ELEMENTS } from './elements';
import { FUUINJUTSU } from './fuuinjutsu';
import { GENJUTSU } from './genjutsu';
import { KENJUTSU } from './kenjutsu';
import { NINJUTSU } from './ninjutsu';
import { SCHOOL_TECHNIQUES } from './schools';
import { LEAF_STANDARD } from './standard';
import { TAIJUTSU } from './taijutsu';

/**
 * The pack's general techniques, about fifteen an art (E 2, D 3, C 4, B 3, A 2, S 1). Clan,
 * sensei, roster and combination techniques live in their own files. Joined inside a
 * pure-annotated function so a release build can drop the fan pack's data.
 */
export const TECHNIQUES: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...TAIJUTSU,
  ...NINJUTSU,
  ...GENJUTSU,
  ...KENJUTSU,
  ...FUUINJUTSU,
  ...LEAF_STANDARD,
  ...LEAF_ELEMENTS,
  ...SCHOOL_TECHNIQUES,
  ...LEAF_CAST_ARMOUR,
])();
