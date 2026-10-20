import type { ClanDef, HiveRite, StrainDef } from '@/content';
import { stageForPair, stageOf } from '@/systems/bonds';
import type { HiveShare } from '@/systems/hives';
import { rankAtLeast } from '@/systems/standing';
import { maxChakra } from '@/systems/vitals';

import { compoundAccess, compoundHere } from '../compounds';
import type { GameContext } from '../context';
import { atHome } from '../home/home';
import { laidUp } from '../injuries';
import { chip, log } from '../ops';
import { bondOf } from '../people/cast';
import type { GameState } from '../state';
import { injuriesFor, inflict } from '../wounds';
import { capFor, chakraBody, strainSheet } from './hive';

/**
 * The install later in life (`docs/design/retinue-plan.md`, step 4d). A hive clan's rite
 * (`ClanHive.rite`) is learned from its archive (lent to a jōnin its head trusts), found on a
 * job, or taught by someone of the clan; then, at home, the body takes the clan's strain at a
 * share of its chakra chosen as a clan child's is, and lies abed while the hive takes hold.
 */

/** The bond with the clan's head that opens the archive (validated: an archive has a head). */
export const ARCHIVE_STAGE = 3;
/** The share of a full hive the rite puts in; the rest breeds at home. */
const FIRST_BROOD = 0.2;
/** Days abed while the hive takes hold, before stamina shortens them, by share. */
export const DAYS_ABED: Readonly<Record<HiveShare, number>> = { little: 3, half: 5, most: 8 };

export interface ClanRite {
  readonly clan: ClanDef;
  readonly rite: HiveRite;
  readonly strain: StrainDef;
}

/** A clan's rite and the strain it puts in, or null when it has none. */
export function riteOf(ctx: GameContext, clanId: string): ClanRite | null {
  const clan = ctx.content.clans.get(clanId);
  const rite = clan?.hive?.rite;
  const strain = clan?.hive ? ctx.content.strains.get(clan.hive.strainId) : undefined;
  return clan && rite && strain ? { clan, rite, strain } : null;
}

export function knowsRite(state: Pick<GameState, 'rites'>, clanId: string): boolean {
  return state.rites.includes(clanId);
}

/** Why the rite is no use to you: born to a hive, already holding one, or knowing it already. */
export function riteBlocker(state: GameState, clanId: string): string | null {
  if (state.hive) return 'You carry a hive already.';
  return knowsRite(state, clanId) ? 'You know this rite already.' : null;
}

/** You learn a clan's rite, with a line saying how. */
export function learnRite(
  state: GameState,
  ctx: GameContext,
  clanId: string,
  how: string,
): GameState {
  const found = riteOf(ctx, clanId);
  if (!found || knowsRite(state, clanId)) return state;
  return log(
    { ...state, rites: [...state.rites, clanId] },
    {
      heading: found.rite.name,
      text: `${how} ${found.rite.description}`,
      tone: 'success',
      chips: [chip(`Learned ${found.rite.name}`, 'gain')],
    },
  );
}

/** Why the archive of this compound won't lend you its rite now, or null. */
export function archiveBlocker(state: GameState, ctx: GameContext, placeId: string): string | null {
  const compound = compoundHere(state, ctx, placeId);
  if (!compound?.keepsRite) return 'There’s no archive like that here.';
  const shut = compoundAccess(state, ctx, compound);
  if (shut) return shut;
  const blocked = riteBlocker(state, compound.clanId);
  if (blocked) return blocked;
  const clan = ctx.content.clans.require(compound.clanId);
  if (!rankAtLeast(state.standing.rank, 'jonin')) {
    return `The ${clan.name} lend their rite to no one below jōnin.`;
  }
  const head = compound.headId ? ctx.content.people.get(compound.headId) : undefined;
  if (!head) return `The ${clan.name} have no head to lend you the rite.`;
  return stageOf(bondOf(state, head.id).points) < ARCHIVE_STAGE
    ? `Only someone ${stageForPair(ARCHIVE_STAGE)} with ${head.name} may read the rite.`
    : null;
}

/** Why you can't take a clan's hive now, or null. */
export function takeHiveBlocker(state: GameState, ctx: GameContext, clanId: string): string | null {
  if (state.hive) return 'You carry a hive already.';
  if (!knowsRite(state, clanId) || !riteOf(ctx, clanId)) return 'You don’t know that rite.';
  if (!atHome(state, ctx)) return 'The rite is done at home, where you can lie abed after.';
  return laidUp(state, ctx);
}

/**
 * The body takes the clan's strain: a first brood at the chosen share (the rest breeds at home),
 * the chakra it gives up gone from today, and days abed while it takes hold.
 */
export function takeHive(
  state: GameState,
  ctx: GameContext,
  clanId: string,
  share: HiveShare,
): GameState {
  const found = riteOf(ctx, clanId);
  const sheet = found ? strainSheet(null, found.strain.id, ctx) : null;
  const [injury] = injuriesFor(ctx, 'rite');
  if (!found || !sheet) return state;
  const cap = capFor(state.character.stats, share, sheet);
  const hive = { strainId: sheet.id, share, count: Math.round(cap * FIRST_BROOD) };
  const fullChakra = maxChakra(chakraBody({ character: state.character, hive }));
  const vitals = {
    ...state.character.vitals,
    chakra: Math.min(state.character.vitals.chakra, fullChakra),
  };
  const taken: GameState = { ...state, hive, character: { ...state.character, vitals } };
  const note = {
    heading: found.rite.name,
    text: `You give your body to the ${found.strain.name.toLowerCase()}. They find their way in, and a share of your chakra is theirs for good.`,
  };
  return injury
    ? inflict(taken, { def: injury, days: DAYS_ABED[share] }, note)
    : log(taken, { ...note, tone: 'success' });
}
