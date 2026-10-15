import type { ConversationDef } from '../../types';

import { GORAN_STORY } from './stories/goran';
import { AKARI_STORY } from './stories/akari';
import { YOMI_STORY } from './stories/yomi';
import { TETSU_STORY } from './stories/tetsu';
import { ITO_STORY } from './stories/ito';

export { GORAN_OLD_DEBT } from './stories/marks';

/**
 * What the village's senseis tell you about themselves, a stage of closeness at a time
 * (`SenseiWays.story`). Gōran's last beat leaves the world mark that opens his arc.
 */
export const SENSEI_STORIES: readonly ConversationDef[] = [
  ...GORAN_STORY,
  ...AKARI_STORY,
  ...YOMI_STORY,
  ...TETSU_STORY,
  ...ITO_STORY,
];
