import type { CombatantView } from '@/systems/combat';

import type { GameContext } from '../context';
import { SHARP_EYES } from '../scouting';
import type { GameState } from '../state';

/**
 * How much of each fighter's bars the fight screen shows. Your side is known exactly: you feel
 * your own reserves, and your crew tell you theirs. A foe is read by your eyes: their health
 * shows as a bar (you can see a wound), their breath, hive and dust as a word (you can see them
 * gasping or the sand thinning), and their chakra, which eyes alone can't see, not at all.
 * Sharp eyes put numbers to what is seen and read the foe's chakra in a word; an awakened
 * bloodline that sees chakra reads it exactly. A fight set up from both sides (versus) is
 * seen in full.
 */

/** Shown with its numbers, as a word, or not at all. */
export type GaugeSight = 'exact' | 'read' | 'hidden';

export interface FighterSight {
  /** The bar always; its numbers only when exact. */
  readonly health: 'exact' | 'bar';
  readonly chakra: GaugeSight;
  /** Breath, a hive, dust: pools the eye can see. */
  readonly pools: 'exact' | 'read';
}

export const SEEN_IN_FULL: FighterSight = { health: 'exact', chakra: 'exact', pools: 'exact' };

/** What you can tell of a foe, by your eyes. */
function foeSight(state: GameState, ctx: GameContext): FighterSight {
  const bloodline = ctx.content.clans.get(state.character.clanId)?.kekkeiGenkai;
  if (bloodline && !bloodline.dormant) return SEEN_IN_FULL;
  const sharp = state.character.stats.perception >= SHARP_EYES;
  return sharp
    ? { health: 'exact', chakra: 'read', pools: 'exact' }
    : { health: 'bar', chakra: 'hidden', pools: 'read' };
}

/** How each fighter's bars are shown in your fights: your side exactly, foes as you read them. */
export function fighterSight(
  state: GameState,
  ctx: GameContext,
): (fighter: Pick<CombatantView, 'side'>) => FighterSight {
  const foes = foeSight(state, ctx);
  return (fighter) => (fighter.side === 'player' ? SEEN_IN_FULL : foes);
}

/** Bands of a pool's share, highest first, and the word for each pool. */
const BANDS: readonly number[] = [0.6, 0.3, 0];
type Words = readonly [string, string, string, string];
/** Dust, and any pool without words of its own. */
const STORE_WORDS: Words = ['Plenty', 'Thinning', 'Almost gone', 'Gone'];
const WORDS: Readonly<Record<string, Words>> = {
  chakra: ['Plenty', 'Flagging', 'Nearly spent', 'Spent'],
  breath: ['Fresh', 'Winded', 'Gasping', 'Spent'],
  hive: ['A full cloud', 'Thinning', 'Almost gone', 'Gone'],
};

/** A pool read in a word, as eyes tell it: chakra under three fifths left is "Flagging". */
export function gaugeRead(pool: string, value: number, max: number): string {
  const words = WORDS[pool] ?? STORE_WORDS;
  if (value <= 0 || max <= 0) return words[3];
  const share = value / max;
  const band = BANDS.findIndex((floor) => share > floor);
  return band === 0 ? words[0] : band === 1 ? words[1] : words[2];
}
