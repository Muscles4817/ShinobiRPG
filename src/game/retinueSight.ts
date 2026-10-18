import { hashUnit } from '@/core';
import type { EnemyDef, FoeSummon, RetinueEntry, RetinueTell } from '@/content';

import type { GameState } from './state';

/**
 * Whether you can tell, before a fight, what fights beside a foe (`EnemyDef.retinue`). A
 * hound at heel is plain to anyone; a body kept out of sight (a sealed puppet) takes a sharp
 * look, and one carried inside (a hive) is rarely seen even by the sharpest eyes. Perception
 * raises the odds and never makes the kept or the hidden certain. Whether you catch it is
 * read from the seed and the foe, never the Rng, so the same notice reads the same way each
 * time, and only grows clearer as your eyes do. A client's report, a recon of their kit or
 * the fight itself shows the whole retinue (`full`). A foe's summoning contract
 * (`EnemyDef.summons`) is read the same way, by its own tell.
 */

/** How much you know of a foe: a glance (a notice, a first look) or everything. */
export type RetinueKnowledge = 'glance' | 'full';

interface Odds {
  /** Perception at which there is a first chance of seeing it. */
  readonly from: number;
  readonly perPoint: number;
  /** The best odds any eyes have. */
  readonly most: number;
}

const ODDS: Readonly<Record<Exclude<RetinueTell, 'open'>, Odds>> = {
  kept: { from: 5, perPoint: 0.06, most: 0.8 },
  hidden: { from: 9, perPoint: 0.03, most: 0.35 },
};

/** The chance a glance at perception `perception` catches a body of this tell. */
export function glanceOdds(tell: RetinueTell, perception: number): number {
  if (tell === 'open') return 1;
  const odds = ODDS[tell];
  return Math.min(odds.most, Math.max(0, (perception - odds.from) * odds.perPoint));
}

/** The bodies of a foe's retinue you can tell are there. */
export function retinueSeen(
  state: GameState,
  def: EnemyDef,
  knowledge: RetinueKnowledge,
): RetinueEntry[] {
  const retinue = def.retinue ?? [];
  if (knowledge === 'full') return [...retinue];
  const perception = state.character.stats.perception;
  return retinue.filter(
    (entry, k) =>
      hashUnit(state.board.seed, 'retinue', def.id, k) < glanceOdds(entry.tell, perception),
  );
}

/** The summons a foe can call that you can tell they hold. */
export function summonsSeen(
  state: GameState,
  def: EnemyDef,
  knowledge: RetinueKnowledge,
): FoeSummon[] {
  const summons = def.summons ?? [];
  if (knowledge === 'full') return [...summons];
  const perception = state.character.stats.perception;
  return summons.filter(
    (entry, k) =>
      hashUnit(state.board.seed, 'summon', def.id, k) < glanceOdds(entry.tell, perception),
  );
}
