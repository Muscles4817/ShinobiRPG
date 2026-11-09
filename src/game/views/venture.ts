import { counted, numberWord } from '@/core';
import { ventureDays, WILD_DEPTHS, type WildDepth } from '@/systems/missions';

import { ventureBlocker } from '../actions/venture';
import type { GameContext } from '../context';
import { rationDays } from '../road';
import type { GameState } from '../state';
import { deepWildsOf } from '../ventures';
import { choice, type Choice } from './common';

/**
 * Going off the paths from a wild place: how far in each depth is, what lives there, and what
 * keeps you from going, said once for the card when it holds for every depth.
 */

export interface VentureDepthView extends Choice {
  readonly depth: WildDepth;
  readonly label: string;
  /** "Three days there and back. Missing-nin hide in the deep." */
  readonly detail: string;
}

export interface VentureView {
  readonly text: string;
  /** What keeps you from going in at all, or null. */
  readonly blocker: string | null;
  /** Food that won't last the longest way in you may take, or null. */
  readonly warning: string | null;
  readonly depths: readonly VentureDepthView[];
}

const DEPTH_LABELS: Readonly<Record<WildDepth, string>> = {
  edge: 'As far as the edge',
  deep: 'Into the deep',
  heart: 'To the heart',
};

/** What lives at each depth, said plainly for the button. */
const DEPTH_HOLDS: Readonly<Record<WildDepth, string>> = {
  edge: 'Wild animals, and the odd poacher.',
  deep: 'People who don’t want to be found hide here, and the first strange beasts.',
  heart: 'Beasts changed by chakra, and older things than those.',
};

function depthView(state: GameState, ctx: GameContext, placeId: string, depth: WildDepth) {
  const days = ventureDays(depth);
  const there = days === 1 ? 'A day, back by morning.' : `${counted(days, 'day')} there and back.`;
  const go = choice(state, ctx, { type: 'venture', placeId, depth });
  return { ...go, depth, label: DEPTH_LABELS[depth], detail: `${there} ${DEPTH_HOLDS[depth]}` };
}

function foodWarning(state: GameState, ctx: GameContext, depths: readonly VentureDepthView[]) {
  const longest = depths.filter((d) => d.blocker === null).at(-1);
  if (!longest) return null;
  const days = ventureDays(longest.depth);
  const food = rationDays(state, ctx);
  if (days <= 1 || food >= days) return null;
  return food === 0
    ? 'Nothing in your pack that keeps out there. The grocer sells rations.'
    : `Your pack holds food for ${numberWord(food)} of the ${counted(days, 'day')}.`;
}

export function ventureView(
  state: GameState,
  ctx: GameContext,
  placeId: string,
  biome: string,
): VentureView | null {
  const country = deepWildsOf(ctx, biome);
  if (!country) return null;
  const shared = ventureBlocker(state, ctx);
  const depths = WILD_DEPTHS.map((depth) => depthView(state, ctx, placeId, depth)).map((d) =>
    d.blocker === shared ? { ...d, blocker: null } : d,
  );
  return {
    text: `Leave the path and go into ${country.name}, a day at each depth and back out the way you came.`,
    blocker: shared,
    warning: shared ? null : foodWarning(state, ctx, depths),
    depths,
  };
}
