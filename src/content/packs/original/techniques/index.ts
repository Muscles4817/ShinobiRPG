import type { TechniqueDef } from '@/systems/techniques';

import { CAST_ARMOUR } from './armour';
import { FINISHERS } from './finishers';
import { FUUINJUTSU } from './fuuinjutsu';
import { GENJUTSU } from './genjutsu';
import { KENJUTSU } from './kenjutsu';
import { ELEMENTAL_NINJUTSU } from './elements';
import { ELEMENT_VARIANTS } from './elementVariants';
import { NINJUTSU } from './ninjutsu';
import { SCHOOL_TECHNIQUES } from './schools';
import { SEALED_ARCHIVE } from './sealedArchive';
import { SEVEN_WICKS } from './sevenWicks';
import { TAIJUTSU } from './taijutsu';
import { TAIJUTSU_VARIANTS } from './taijutsuVariants';

/**
 * The general techniques of the setting, one file per art, E to S. Clan, sensei, roster and
 * combination techniques live beside the pack's people.
 */
export const TECHNIQUES: readonly TechniqueDef[] = [
  ...TAIJUTSU,
  ...TAIJUTSU_VARIANTS,
  ...NINJUTSU,
  ...ELEMENTAL_NINJUTSU,
  ...ELEMENT_VARIANTS,
  ...GENJUTSU,
  ...KENJUTSU,
  ...FUUINJUTSU,
  ...SCHOOL_TECHNIQUES,
  ...SEVEN_WICKS,
  ...FINISHERS,
  ...SEALED_ARCHIVE,
  ...CAST_ARMOUR,
];
