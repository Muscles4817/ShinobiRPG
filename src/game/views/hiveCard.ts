import { BREED_AT_HOME } from '@/systems/hives';

import type { GameContext } from '../context';
import { yourHive } from '../hives/hive';
import type { GameState } from '../state';

/**
 * Your hive on the Shinobi tab: its strain, the share of chakra it took, and how full it is,
 * in words, with how soon it fills again.
 */

export interface HiveCard {
  readonly strain: string;
  readonly description: string;
  readonly share: string;
  /** How full it is, 0 to 1, for the bar. */
  readonly fill: number;
  readonly state: string;
  readonly breeding: string;
}

const SHARE_LINE = {
  little: 'It took a quarter of your chakra.',
  half: 'It took half your chakra.',
  most: 'It took most of your chakra.',
} as const;

function stateWord(fill: number): string {
  if (fill >= 1) return 'Full';
  if (fill >= 0.6) return 'Thinned';
  return fill > 0 ? 'Thin' : 'Spent';
}

function breedingLine(fill: number): string {
  if (fill >= 1) return 'The hive is as full as your body can keep it.';
  const days = Math.ceil((1 - fill) / BREED_AT_HOME);
  return days <= 1
    ? 'A night at home will see it full again.'
    : 'A few days at home will see it full again; it breeds slowly away.';
}

export function hiveCard(state: GameState, ctx: GameContext): HiveCard | null {
  const yours = yourHive(state, ctx);
  if (!yours) return null;
  const fill = yours.cap > 0 ? Math.min(1, yours.hive.count / yours.cap) : 0;
  return {
    strain: yours.strain.name,
    description: yours.strain.description,
    share: SHARE_LINE[yours.hive.share],
    fill,
    state: stateWord(fill),
    breeding: breedingLine(fill),
  };
}
