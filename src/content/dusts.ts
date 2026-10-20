import type { CombatGround, DustBane, DustGift, DustQuality } from '@/systems/combat';

import type { QualityGrade } from './strains';

/**
 * Commanded dust (`docs/design/retinue-plan.md`, step 4e): the kinds of matter a user can hold
 * up and fight with (sand, iron sand, gold dust, ash, glass). A kind has the qualities every
 * dust has, graded E to A (weight, hold, draw), the gifts only it carries, weak to great (1 to
 * 3: cutting, blinding), what scatters it, and the grounds that hold it, where a draw pulls it
 * up in full. They are shared by every pack; a pack decides who commands them. The fight reads
 * them as a `DustKind`.
 */
export interface DustDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly qualities: Readonly<Record<DustQuality, QualityGrade>>;
  readonly gifts: Readonly<Partial<Record<DustGift, 1 | 2 | 3>>>;
  readonly banes: readonly DustBane[];
  readonly drawnOn: readonly CombatGround[];
  /**
   * For dust no ground gives back: what a batch made at home costs in materials (ryo), beside
   * an afternoon's work. Required of every kind with no `drawnOn` (validated).
   */
  readonly making?: { readonly ryo: number; readonly how: string };
  /** What a batch costs bought ready-made, where a shop sells it (`dustIds`). */
  readonly price?: number;
  /** Techniques its S-rank scroll teaches with the command of it (`reward.dustScroll`). */
  readonly techniqueIds?: readonly string[];
}

/** A clan whose children are born commanding a kind of dust, a store of it to hand. */
export interface ClanDust {
  readonly dustId: string;
}
