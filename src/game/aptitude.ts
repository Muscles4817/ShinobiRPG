import type { Rng } from '@/core';
import type { ClanDef, TalentDef } from '@/content';
import type { TalentBand } from '@/systems/profile';
import type { ModifierSpec } from '@/systems/modifiers';
import {
  APTITUDE_MAX,
  rollAptitude,
  STAT_IDS,
  type Aptitude,
  type AptitudeOdds,
  type StatId,
} from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';

/**
 * Where a character's talent comes from. Clan shinobi have a high floor and a narrow spread in
 * their clan's arts and are ordinary elsewhere; the clanless gamble on a wide spread (a few
 * prodigies, a few holes, sometimes an art that will never take). The talent on your academy
 * file sets a floor in the stats it raises, and the clan's and talent's growth multipliers
 * tilt the roll: aptitude is where those multipliers now act. Where you stood in your class
 * shifts the whole roll (`TalentBand`): the dead last draw low, a genius high and is never less
 * than gifted in their A-graded arts. A talent may fix some stats outright (0: never).
 */

/** Where a character stood, as the roll needs it; classmates and the cast roll as the middle. */
export interface TalentShape {
  readonly band: TalentBand;
  /** The arts graded highest on their file: never voided, and gifted in a genius. */
  readonly specialties: readonly Discipline[];
}

const MIDDLE: TalentShape = { band: { scale: 1, prodigy: 0, hole: 0 }, specialties: [] };

/** A clan member's aptitude in the clan's arts. */
const CLAN_ART_ODDS = { floor: 1.1, ceiling: 1.4 } as const;
/** A clan member's aptitude elsewhere: ordinary, now and then a weak spot. */
const CLAN_OTHER_ODDS = { floor: 0.75, ceiling: 1.2, hole: 0.03 } as const;
/** The clanless: anything can happen. */
const CLANLESS_ODDS = { floor: 0.6, ceiling: 1.35, prodigy: 0.08, hole: 0.1 } as const;
/**
 * The arts graded best on your file are never a hole: they roll at least this (scaled by where
 * you stood), so an A in taijutsu never sits on no talent for it.
 */
const BEST_ART_FLOOR = 0.8;
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

function baseOdds(clan: ClanDef, stat: StatId): AptitudeOdds {
  if (clan.arts.length === 0) return CLANLESS_ODDS;
  return clan.arts.includes(stat) ? CLAN_ART_ODDS : CLAN_OTHER_ODDS;
}

/** The odds shifted by where they stood: ranges scaled, prodigies and holes likelier or not. */
function shifted(odds: AptitudeOdds, band: TalentBand): AptitudeOdds {
  return {
    ...odds,
    floor: odds.floor * band.scale,
    ceiling: odds.ceiling * band.scale,
    prodigy: Math.max(0, (odds.prodigy ?? 0) + band.prodigy),
    hole: Math.max(0, (odds.hole ?? 0) + band.hole),
  };
}

function oddsFor(
  clan: ClanDef,
  talent: TalentDef | undefined,
  shape: TalentShape,
): (stat: StatId) => AptitudeOdds {
  const tilt = identityTilt([clan.modifiers, talent?.modifiers ?? {}]);
  const specialty = (stat: StatId) => shape.specialties.some((d) => d === stat);
  return (stat) => {
    const raised = (talent?.statBonuses[stat] ?? 0) > 0;
    const best = shape.band.specialtyAtLeast ?? BEST_ART_FLOOR * shape.band.scale;
    const floors = [raised ? TALENT_FLOOR : 0, specialty(stat) ? best : 0];
    const atLeast = Math.max(...floors);
    return {
      ...shifted(baseOdds(clan, stat), shape.band),
      tilt: tilt[stat],
      ...(atLeast > 0 ? { atLeast } : {}),
    };
  };
}

/**
 * Rolls a new character's aptitude, continuing the break-in's dice. The clanless always draw
 * for a void art, so the sequence after it doesn't depend on the clan. Classmates and other
 * people are rolled the same way, with no talent on file.
 */
export function rollCharacterAptitude(
  rng: Rng,
  clan: ClanDef,
  talent?: TalentDef,
  shape: TalentShape = MIDDLE,
): Aptitude {
  const rolled: Record<StatId, number> = { ...rollAptitude(rng, oddsFor(clan, talent, shape)) };
  const luck = rng.next();
  const art = rng.pick(DISCIPLINES);
  const kept = (talent?.statBonuses[art] ?? 0) > 0 || shape.specialties.includes(art);
  if (clan.arts.length === 0 && luck < VOID_ART_CHANCE && !kept) rolled[art] = 0;
  return { ...rolled, ...talent?.aptitude };
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
