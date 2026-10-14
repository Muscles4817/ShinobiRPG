import type { TechniqueDef } from '@/systems/techniques';

import { CANON_AKIMICHI } from './akimichi';
import { CANON_CLAN_TECHNIQUES } from './clans';
import { CANON_ELEMENTS } from './elements';
import { CANON_GATES } from './gates';
import { CANON_LIGHTNING } from './lightning';
import { CANON_MEDICAL } from './medical';
import { CANON_NARUTO_TECHNIQUES } from './naruto';
import { CANON_SENSEI_TECHNIQUES } from './senseis';
import { CANON_STANDARD } from './standard';

/**
 * Canon jutsu added from the Narutopedia research (`docs/research/naruto-jutsu.md`), a file per
 * group of users. Joined inside a pure-annotated function so a release build drops them.
 */
export const CANON_TECHNIQUES: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...CANON_STANDARD,
  ...CANON_ELEMENTS,
  ...CANON_SENSEI_TECHNIQUES,
  ...CANON_NARUTO_TECHNIQUES,
  ...CANON_MEDICAL,
  ...CANON_CLAN_TECHNIQUES,
  ...CANON_AKIMICHI,
  ...CANON_LIGHTNING,
  ...CANON_GATES,
])();
