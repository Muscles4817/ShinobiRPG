import { stageForPair, stageName, stageOf, stageProgress } from '@/systems/bonds';
import {
  ordersOpen,
  ordersStages,
  STRAY_VISITS_NEEDED,
  type CompanionTemperament,
} from '@/systems/companions';
import { STAT_IDS, STAT_INFO, statTier } from '@/systems/stats';

import { kindOf, playerCompanion } from '../companions/make';
import { strayToday } from '../companions/stray';
import type { GameContext } from '../context';
import { currentLocation } from '../ops';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** Your companion on the Bonds tab, and a stray about in the village. */

/** How many of its best stats its card shows. */
const STANDOUTS_SHOWN = 3;

export interface CompanionCard {
  readonly name: string;
  /** Its kind: "Ninken", "Stray hound". */
  readonly kind: string;
  readonly description: string;
  readonly stageName: string;
  /** Progress through the current stage, 0–1. */
  readonly progress: number;
  /** What it takes from you in a fight, in words. */
  readonly orders: string;
  /** Its best stats, as grades ("Speed D"). */
  readonly standouts: readonly string[];
}

export interface StrayNotice {
  readonly text: string;
  /** "Near the Market Street". */
  readonly where: string;
  /** Days spent with it so far, and how many it takes. */
  readonly visits: number;
  readonly needed: number;
  readonly befriend: Choice;
}

function ordersLine(name: string, bond: number, temperament: CompanionTemperament): string {
  const open = ordersOpen(bond, temperament);
  const at = ordersStages(temperament);
  if (open.cards) return `${name} fights as you plan it.`;
  if (open.stance)
    return `${name} takes your stance orders; your plan for it once you are ${stageForPair(at.cards)}.`;
  return `${name} fights its own way until you are ${stageForPair(at.stance)}.`;
}

export function companionCard(state: GameState, ctx: GameContext): CompanionCard | null {
  const companion = playerCompanion(state);
  if (!companion) return null;
  const kind = kindOf(companion, ctx);
  const best = [...STAT_IDS]
    .filter((id) => id !== 'reserves')
    .sort((a, b) => companion.stats[b] - companion.stats[a])
    .slice(0, STANDOUTS_SHOWN);
  return {
    name: companion.name,
    kind: kind.name,
    description: kind.description,
    stageName: stageName(stageOf(companion.bond)),
    progress: stageProgress(companion.bond),
    orders: ordersLine(companion.name, companion.bond, kind.temperament),
    standouts: best.map((id) => `${STAT_INFO[id].label} ${statTier(companion.stats[id]).grade}`),
  };
}

export function strayNotice(state: GameState, ctx: GameContext): StrayNotice | null {
  const stray = strayToday(state, ctx);
  if (!stray) return null;
  const place = currentLocation(state, ctx).places.find((p) => p.id === stray.placeId);
  const befriending = state.companions.befriending;
  return {
    text: stray.kind.stray.line,
    where: place ? `Near the ${place.name.replace(/^The /, '')}` : 'In the streets',
    visits: befriending?.kindId === stray.kind.id ? befriending.visits : 0,
    needed: STRAY_VISITS_NEEDED,
    befriend: choice(state, ctx, { type: 'befriendStray' }),
  };
}
