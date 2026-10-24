import { ORIGINAL_FOE_KIT } from '@/content/packs/original/bestiaryKit';
import { ORIGINAL_NATURE_KIT, ORIGINAL_VILLAGES } from '@/content/packs/original/shinobiVillages';
import { foreignShinobi } from '@/content/shared/foreignShinobi';
import { ctx } from '@/test/gameFixtures';

/**
 * The foreign shinobi bench's foes: every village's squads and missing-nin, composed from
 * templates (`shared/foreignShinobi`), so a template tuned wrong is wrong for every village at
 * once. Its two halves (`foreignBench*.test.ts`) run side by side.
 */

/** Fewer seeds than the bestiary's: ninety foes, and each template is met three times. */
export const FOREIGN_SEEDS = 10;
/** Thousands of fights take a while on a slow runner. */
export const FOREIGN_TIMEOUT_MS = 30_000;

export const FOREIGN_FOES = foreignShinobi(ORIGINAL_VILLAGES, {
  kit: ORIGINAL_FOE_KIT,
  natures: ORIGINAL_NATURE_KIT,
}).map((e) => ctx.content.enemies.require(e.id));
