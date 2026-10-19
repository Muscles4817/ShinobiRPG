import { QUALITY_GRADES } from '@/content';
import { SWARM_GIFTS, SWARM_QUALITIES, type SwarmGift, type SwarmQuality } from '@/systems/combat';
import { BREED_AT_HOME } from '@/systems/hives';

import type { GameContext } from '../context';
import { qualitiesInBody, yourHive } from '../hives/hive';
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
  /** What its species can do, in words ("Drains chakra, greatly"). */
  readonly gifts: readonly string[];
  /** Its qualities in your body, graded E to A. */
  readonly qualities: readonly { readonly name: string; readonly grade: string }[];
  /** What it can't stand ("Fire"). */
  readonly fears: readonly string[];
}

const GIFT_WORDS: Readonly<Record<SwarmGift, string>> = {
  drain: 'Drains chakra',
  camouflage: 'Hard to see coming',
  glow: 'Marks a foe with glowing dust',
  blinding: 'Blinds with its scales',
  venom: 'Venomous',
};
const STRENGTH = ['', 'a little', 'strongly', 'greatly'] as const;
const QUALITY_NAMES: Readonly<Record<SwarmQuality, string>> = {
  speed: 'Speed',
  bite: 'Bite',
  toughness: 'Toughness',
  brood: 'Brood',
  size: 'Smallness',
  senses: 'Senses',
};

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
  const inBody = qualitiesInBody(yours.strain);
  const fill = yours.cap > 0 ? Math.min(1, yours.hive.count / yours.cap) : 0;
  return {
    strain: yours.strain.name,
    description: yours.strain.description,
    share: SHARE_LINE[yours.hive.share],
    fill,
    state: stateWord(fill),
    breeding: breedingLine(fill),
    gifts: SWARM_GIFTS.flatMap((gift) => {
      const strength = yours.strain.gifts[gift];
      return strength ? [`${GIFT_WORDS[gift]}, ${STRENGTH[strength]}`] : [];
    }),
    qualities: SWARM_QUALITIES.map((q) => ({
      name: QUALITY_NAMES[q],
      grade: QUALITY_GRADES[inBody[q] - 1] ?? 'A',
    })),
    fears: yours.strain.fears.map((e) => e.charAt(0).toUpperCase() + e.slice(1)),
  };
}
