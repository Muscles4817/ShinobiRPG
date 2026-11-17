import type { TechniqueDef } from '@/systems/techniques';

import type { PersonDef } from '../../../../types';
import { CURSE_MARK_ARTS } from './curseMark';
import { KABUTO } from './kabuto';
import { JIROBO, JIROBO_ARTS } from './jirobo';
import { KIDOMARU, KIDOMARU_ARTS } from './kidomaru';
import { KIMIMARO, KIMIMARO_ARTS } from './kimimaro';
import { SAKON, SAKON_ARTS } from './sakon';
import { TAKA_ARTS, TAKA_FIGHTERS } from './taka';
import { TAYUYA, TAYUYA_ARTS } from './tayuya';
import { ZAKU, ZAKU_ARTS } from './zaku';

/**
 * Orochimaru's people as fighters for versus: Kabuto, Kimimaro, the Sound Four and the Sound
 * genin, and the team Sasuke later gathered from his hideouts. Joined inside pure-annotated
 * functions so a release build drops them with the fan pack.
 */
export const SOUND_FIGHTERS: readonly PersonDef[] = /*#__PURE__*/ (() => [
  KABUTO,
  KIMIMARO,
  JIROBO,
  KIDOMARU,
  SAKON,
  TAYUYA,
  ZAKU,
  ...TAKA_FIGHTERS,
])();
export const SOUND_ARTS: readonly TechniqueDef[] = /*#__PURE__*/ (() => [
  ...CURSE_MARK_ARTS,
  ...KIMIMARO_ARTS,
  ...JIROBO_ARTS,
  ...KIDOMARU_ARTS,
  ...SAKON_ARTS,
  ...TAYUYA_ARTS,
  ...ZAKU_ARTS,
  ...TAKA_ARTS,
])();

export { DOKI } from './tayuya';
