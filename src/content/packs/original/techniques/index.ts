import type { TechniqueDef } from '@/systems/techniques';

import { FUUINJUTSU } from './fuuinjutsu';
import { GENJUTSU } from './genjutsu';
import { KENJUTSU } from './kenjutsu';
import { NINJUTSU } from './ninjutsu';
import { TAIJUTSU } from './taijutsu';

/**
 * The general techniques of the setting, one file per art, E to S. Clan, sensei, roster and
 * combination techniques live beside the pack's people.
 */
export const TECHNIQUES: readonly TechniqueDef[] = [
  ...TAIJUTSU,
  ...NINJUTSU,
  ...GENJUTSU,
  ...KENJUTSU,
  ...FUUINJUTSU,
];
