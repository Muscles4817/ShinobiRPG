import type { ClanDef } from '@/content';
import { HIVE_SHARES, type HiveShare } from '@/systems/hives';

import type { GameContext } from '../context';

/**
 * The hive a child of a hive clan is born with, as the academy file offers it: the strain, and
 * the three shares of chakra it may be given, each said in words (what it keeps and what it
 * costs), never in numbers.
 */

export interface HiveShareOption {
  readonly id: HiveShare;
  readonly name: string;
  readonly description: string;
}

export interface HiveChoice {
  readonly strain: string;
  readonly description: string;
  readonly shares: readonly HiveShareOption[];
}

const SHARE_WORDS: Readonly<Record<HiveShare, Omit<HiveShareOption, 'id'>>> = {
  little: {
    name: 'A quarter',
    description: 'A small hive. Most of your chakra stays your own.',
  },
  half: {
    name: 'Half',
    description: 'The clan’s way: half your chakra to the hive, and a hive worth the name.',
  },
  most: {
    name: 'Most',
    description: 'A great hive, and little chakra of your own. You fight through them.',
  },
};

export function hiveChoice(clan: ClanDef, ctx: GameContext): HiveChoice | null {
  const strain = clan.hive ? ctx.content.strains.get(clan.hive.strainId) : undefined;
  if (!strain) return null;
  return {
    strain: strain.name,
    description: strain.description,
    shares: HIVE_SHARES.map((id) => ({ id, ...SHARE_WORDS[id] })),
  };
}
