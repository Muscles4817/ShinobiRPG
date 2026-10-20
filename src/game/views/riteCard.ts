import type { HiveShare } from '@/systems/hives';

import type { GameContext } from '../context';
import { riteOf } from '../hives/rite';
import type { GameState } from '../state';
import { choice, type Choice } from './common';
import { hiveChoice, type HiveShareOption } from './hiveChoice';

/**
 * A hive clan's rite you have learned and not yet taken (`hives/rite.ts`), on the Shinobi tab:
 * what it is, the strain it puts in, and the three shares of chakra it may be given, each with
 * how long it keeps you abed, in words.
 */

export interface RiteShare extends HiveShareOption {
  /** How long the hive takes to take hold at this share. */
  readonly abed: string;
  readonly take: Choice;
}

export interface RiteCard {
  readonly clanId: string;
  readonly name: string;
  readonly description: string;
  readonly strain: string;
  readonly shares: readonly RiteShare[];
}

/** Each share's days abed (`DAYS_ABED`), before stamina shortens them, in words. */
const ABED_WORDS: Readonly<Record<HiveShare, string>> = {
  little: 'A few days abed.',
  half: 'Most of a week abed.',
  most: 'Over a week abed.',
};

/** The rites you know and could take: none once you carry a hive. */
export function riteCards(state: GameState, ctx: GameContext): readonly RiteCard[] {
  if (state.hive) return [];
  return state.rites.flatMap((clanId) => {
    const found = riteOf(ctx, clanId);
    const offered = found ? hiveChoice(found.clan, ctx) : null;
    if (!found || !offered) return [];
    return [
      {
        clanId,
        name: found.rite.name,
        description: found.rite.description,
        strain: found.strain.name,
        shares: offered.shares.map((s) => ({
          ...s,
          abed: ABED_WORDS[s.id],
          take: choice(state, ctx, { type: 'takeHive', clanId, share: s.id }),
        })),
      },
    ];
  });
}
