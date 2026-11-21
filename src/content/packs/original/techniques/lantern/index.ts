import type { TechniqueDef } from '@/systems/techniques';

import { LANTERN_TAIJUTSU } from './taijutsu';
import { LANTERN_TAIJUTSU2 } from './taijutsu2';
import { LANTERN_NINJUTSU } from './ninjutsu';
import { LANTERN_NINJUTSU2 } from './ninjutsu2';
import { LANTERN_NINJUTSU3 } from './ninjutsu3';
import { LANTERN_NINJUTSU4 } from './ninjutsu4';
import { LANTERN_NINJUTSU5 } from './ninjutsu5';
import { LANTERN_GENJUTSU } from './genjutsu';
import { LANTERN_KENJUTSU } from './kenjutsu';
import { LANTERN_KENJUTSU2 } from './kenjutsu2';
import { LANTERN_FUUINJUTSU } from './fuuinjutsu';

/** The lantern country’s newer techniques, by art (where each is learned: `kits/sources.ts`). */
export const LANTERN_TECHNIQUES: readonly TechniqueDef[] = [
  ...LANTERN_TAIJUTSU,
  ...LANTERN_TAIJUTSU2,
  ...LANTERN_NINJUTSU,
  ...LANTERN_NINJUTSU2,
  ...LANTERN_NINJUTSU3,
  ...LANTERN_NINJUTSU4,
  ...LANTERN_NINJUTSU5,
  ...LANTERN_GENJUTSU,
  ...LANTERN_KENJUTSU,
  ...LANTERN_KENJUTSU2,
  ...LANTERN_FUUINJUTSU,
];
