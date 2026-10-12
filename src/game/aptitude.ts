import type { Rng } from '@/core';
import type { ClanDef, TalentDef } from '@/content';
import type { ModifierSpec } from '@/systems/modifiers';
import {
  APTITUDE_MAX,
  rollAptitude,
  STAT_IDS,
  type Aptitude,
  type AptitudeOdds,
  type StatId,
} from '@/systems/stats';
import { DISCIPLINES } from '@/systems/techniques';

/**
 * Where a character's talent comes from. Clan shinobi have a high floor and a narrow spread in
 * their clan's arts and are ordinary elsewhere; the clanless gamble on a wide spread (a few
 * prodigies, a few holes, sometimes an art that will never take). The talent on your academy
 * file sets a floor in the stats it raises, and the clan's and talent's growth multipliers
 * tilt the roll: aptitude is where those multipliers now act.
 */

/** A clan member's aptitude in the clan's arts. */
const CLAN_ART_ODDS = { floor: 1.1, ceiling: 1.4 } as const;
/** A clan member's aptitude elsewhere: ordinary, now and then a weak spot. */
const CLAN_OTHER_ODDS = { floor: 0.75, ceiling: 1.2, hole: 0.03 } as const;
/** The clanless: anything can happen. */
const CLANLESS_ODDS = { floor: 0.6, ceiling: 1.35, prodigy: 0.08, hole: 0.1 } as const;
/** Stats the talent on your file raises never roll below this. */
const TALENT_FLOOR = 1;
/** Chance a clanless character has one art (discipline) that will never take. */
const VOID_ART_CHANCE = 0.12;

/** The growth multiplier per stat that a set of identity specs gives (growth × training). */
export function identityTilt(specs: readonly ModifierSpec[]): Record<StatId, number> {
  const tilt = (stat: StatId) =>
    specs.reduce((m, spec) => m * (spec.growth?.[stat] ?? 1) * (spec.training ?? 1), 1);
  return Object.fromEntries(STAT_IDS.map((id) => [id, tilt(id)])) as Record<StatId, number>;
}

/** Clan and talent specs without their growth, which aptitude carries instead. */
export function withoutGrowth({ growth: _g, training: _t, ...rest }: ModifierSpec): ModifierSpec {
  return rest;
}

function oddsFor(clan: ClanDef, talent: TalentDef | undefined): (stat: StatId) => AptitudeOdds {
  const tilt = identityTilt([clan.modifiers, talent?.modifiers ?? {}]);
  return (stat) => {
    const base =
      clan.arts.length === 0
        ? CLANLESS_ODDS
        : clan.arts.includes(stat)
          ? CLAN_ART_ODDS
          : CLAN_OTHER_ODDS;
    const raised = (talent?.statBonuses[stat] ?? 0) > 0;
    return { ...base, tilt: tilt[stat], ...(raised ? { atLeast: TALENT_FLOOR } : {}) };
  };
}

/**
 * Rolls a new character's aptitude, continuing the break-in's dice. The clanless always draw
 * for a void art, so the sequence after it doesn't depend on the clan. Classmates and other
 * people are rolled the same way, with no talent on file.
 */
export function rollCharacterAptitude(rng: Rng, clan: ClanDef, talent?: TalentDef): Aptitude {
  const rolled: Record<StatId, number> = { ...rollAptitude(rng, oddsFor(clan, talent)) };
  const luck = rng.next();
  const art = rng.pick(DISCIPLINES);
  const raised = (talent?.statBonuses[art] ?? 0) > 0;
  if (clan.arts.length === 0 && luck < VOID_ART_CHANCE && !raised) rolled[art] = 0;
  return rolled;
}

/**
 * Aptitude for a character made before talent existed: exactly the growth their clan and
 * talent used to give, so nothing about how they grow changes.
 */
export function derivedAptitude(specs: readonly ModifierSpec[]): Aptitude {
  const tilt = identityTilt(specs);
  const capped = STAT_IDS.map((id) => [id, Math.min(APTITUDE_MAX, tilt[id])] as const);
  return Object.fromEntries(capped) as Record<StatId, number>;
}
