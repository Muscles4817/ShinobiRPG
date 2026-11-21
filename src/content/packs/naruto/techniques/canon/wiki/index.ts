import type { TechniqueDef } from '@/systems/techniques';

import { WIKI_TAIJUTSU } from './taijutsu';
import { WIKI_NINJUTSU } from './ninjutsu';
import { WIKI_NINJUTSU2 } from './ninjutsu2';
import { WIKI_NINJUTSU3 } from './ninjutsu3';
import { WIKI_NINJUTSU4 } from './ninjutsu4';
import { WIKI_NINJUTSU5 } from './ninjutsu5';
import { WIKI_NINJUTSU6 } from './ninjutsu6';
import { WIKI_NINJUTSU7 } from './ninjutsu7';
import { WIKI_NINJUTSU8 } from './ninjutsu8';
import { WIKI_NINJUTSU9 } from './ninjutsu9';
import { WIKI_GENJUTSU } from './genjutsu';
import { WIKI_KENJUTSU } from './kenjutsu';
import { WIKI_KENJUTSU2 } from './kenjutsu2';
import { WIKI_FUUINJUTSU } from './fuuinjutsu';

/** Canon techniques drafted from Narutopedia for the versus fighters (`canonKits/`). */
export const WIKI_TECHNIQUES: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...WIKI_TAIJUTSU,
  ...WIKI_NINJUTSU,
  ...WIKI_NINJUTSU2,
  ...WIKI_NINJUTSU3,
  ...WIKI_NINJUTSU4,
  ...WIKI_NINJUTSU5,
  ...WIKI_NINJUTSU6,
  ...WIKI_NINJUTSU7,
  ...WIKI_NINJUTSU8,
  ...WIKI_NINJUTSU9,
  ...WIKI_GENJUTSU,
  ...WIKI_KENJUTSU,
  ...WIKI_KENJUTSU2,
  ...WIKI_FUUINJUTSU,
])();
