import type { TechniqueDef } from '@/systems/techniques';

import { CANON_AKIMICHI } from './akimichi';
import { CANON_ANIME_TECHNIQUES } from './anime';
import { CANON_CLAN_TECHNIQUES } from './clans';
import { CANON_ANIME_CLAN_TECHNIQUES } from './clansAnime';
import { CANON_ELEMENTS } from './elements';
import { CANON_GATES } from './gates';
import { CANON_LIGHTNING } from './lightning';
import { CANON_LATER_CLAN_TECHNIQUES } from './clansLater';
import { CANON_MEDICAL } from './medical';
import { CANON_NARUTO_TECHNIQUES } from './naruto';
import { CANON_RASENGAN } from './rasengan';
import { CANON_SASUKE_TECHNIQUES } from './sasuke';
import { CANON_SENSEI_TECHNIQUES } from './senseis';
import { CANON_STANDARD } from './standard';
import { CANON_TOOL_TECHNIQUES } from './tools';

/**
 * Canon jutsu added from the Narutopedia research (`docs/research/naruto-jutsu.md`), a file per
 * group of users. Joined inside a pure-annotated function so a release build drops them.
 */
export const CANON_TECHNIQUES: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...CANON_STANDARD,
  ...CANON_ELEMENTS,
  ...CANON_SENSEI_TECHNIQUES,
  ...CANON_NARUTO_TECHNIQUES,
  ...CANON_RASENGAN,
  ...CANON_SASUKE_TECHNIQUES,
  ...CANON_MEDICAL,
  ...CANON_CLAN_TECHNIQUES,
  ...CANON_AKIMICHI,
  ...CANON_LATER_CLAN_TECHNIQUES,
  ...CANON_LIGHTNING,
  ...CANON_GATES,
  ...CANON_ANIME_TECHNIQUES,
  ...CANON_ANIME_CLAN_TECHNIQUES,
  ...CANON_TOOL_TECHNIQUES,
])();
