import { hashUnit } from '@/core';
import type { ClanDef, CompanionKindDef } from '@/content';
import {
  grownDaysAt,
  NO_COMPANIONS,
  PLAYER_OWNER,
  type Companion,
  type Companions,
} from '@/systems/companions';
import { createStats, STAT_IDS, type Aptitude } from '@/systems/stats';
import { START_TIME } from '@/systems/time';
import { MAX_HEALTH } from '@/systems/vitals';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { withGrownBody } from './body';

/**
 * A new companion of a kind: its skills from the kind's start, a talent rolled within the
 * kind's shape (an art it can never learn stays never), a name, and a body as grown as the way
 * it came to you (`ARRIVES_AT`), all drawn from the seed and its id, never the Rng.
 */

/**
 * How far grown each way of coming by one arrives: a clan child's pup half grown by
 * graduation, a kennel pup and a rescued one small, a stray and a wild one grown.
 */
export const ARRIVES_AT = {
  born: 0.5,
  kennel: 0.25,
  rescue: 0.15,
  stray: 1,
  wild: 1,
} as const;
export type Arrival = keyof typeof ARRIVES_AT;

/** How far one animal's talent may sit either side of its kind's. */
const TALENT_SPREAD = 0.15;

export interface CompanionStart {
  readonly id: string;
  readonly seed: number;
  /** The day it joins you; it grows from the next. */
  readonly day: number;
  readonly bond: number;
  readonly arrival: Arrival;
}

function rolledAptitude(kind: CompanionKindDef, seed: number, id: string): Aptitude {
  const entries = STAT_IDS.map((stat) => {
    const shape = kind.aptitude[stat] ?? 1;
    const spread = (hashUnit(seed, 'companion', id, stat) * 2 - 1) * TALENT_SPREAD;
    return [stat, shape * (1 + spread)] as const;
  });
  return Object.fromEntries(entries) as Aptitude;
}

export function newCompanion(kind: CompanionKindDef, start: CompanionStart): Companion {
  const pick = Math.floor(hashUnit(start.seed, 'companion-name', start.id) * kind.names.length);
  const grownDays = grownDaysAt(ARRIVES_AT[start.arrival], kind.body.maturesInDays);
  const skills = createStats(kind.baseStat, kind.statBonuses);
  const stats = withGrownBody({ id: start.id, grownDays, stats: skills }, kind, start.seed);
  return {
    id: start.id,
    kindId: kind.id,
    name: kind.names[pick] ?? kind.name,
    stats,
    aptitude: rolledAptitude(kind, start.seed, start.id),
    bond: start.bond,
    lastGrownDay: start.day,
    health: maxHealthOf(kind),
    lastFedDay: start.day,
    lastPlayDay: null,
    injury: null,
    favouriteKnown: false,
    grownDays,
    lastTrainedDay: null,
    lastCaredDay: start.day,
  };
}

/** A companion's full health: a human's, scaled by its kind. */
export function maxHealthOf(kind: Pick<CompanionKindDef, 'healthScale'>): number {
  return Math.round(MAX_HEALTH * kind.healthScale);
}

/** A clan child's companion, raised with them, there from the first day (`ClanDef.companion`). */
export function bornCompanions(clan: ClanDef, seed: number, ctx: GameContext): Companions {
  const born = clan.companion;
  if (!born) return NO_COMPANIONS;
  const kind = ctx.content.companionKinds.require(born.kindId);
  const start = {
    id: `${kind.id}-born`,
    seed,
    day: START_TIME.day - 1,
    bond: born.bond,
    arrival: 'born' as const,
  };
  return { ...NO_COMPANIONS, owned: { [PLAYER_OWNER]: newCompanion(kind, start) } };
}

/** The player's companion, if they have one. */
export function playerCompanion(state: Pick<GameState, 'companions'>): Companion | null {
  return state.companions.owned[PLAYER_OWNER] ?? null;
}

/** A companion's kind (validation guarantees it exists). */
export function kindOf(companion: Companion, ctx: GameContext): CompanionKindDef {
  return ctx.content.companionKinds.require(companion.kindId);
}
