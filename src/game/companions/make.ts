import { hashUnit } from '@/core';
import type { ClanDef, CompanionKindDef } from '@/content';
import { NO_COMPANIONS, PLAYER_OWNER, type Companion, type Companions } from '@/systems/companions';
import { createStats, STAT_IDS, type Aptitude } from '@/systems/stats';
import { START_TIME } from '@/systems/time';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * A new companion of a kind: its kind's starting stats, a talent rolled within the kind's
 * shape (an art it can never learn stays never) and a name, all drawn from the seed and its
 * id, never the Rng.
 */

/** How far one animal's talent may sit either side of its kind's. */
const TALENT_SPREAD = 0.15;

export interface CompanionStart {
  readonly id: string;
  readonly seed: number;
  /** The day it joins you; it grows from the next. */
  readonly day: number;
  readonly bond: number;
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
  return {
    id: start.id,
    kindId: kind.id,
    name: kind.names[pick] ?? kind.name,
    stats: createStats(kind.baseStat, kind.statBonuses),
    aptitude: rolledAptitude(kind, start.seed, start.id),
    bond: start.bond,
    lastGrownDay: start.day,
  };
}

/** A clan child's companion, raised with them, there from the first day (`ClanDef.companion`). */
export function bornCompanions(clan: ClanDef, seed: number, ctx: GameContext): Companions {
  const born = clan.companion;
  if (!born) return NO_COMPANIONS;
  const kind = ctx.content.companionKinds.require(born.kindId);
  const start = { id: `${kind.id}-born`, seed, day: START_TIME.day - 1, bond: born.bond };
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
