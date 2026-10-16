import type { CombatAttributes, CombatPerk, CombatTechnique } from '../contract';
import { isHarmful } from './verbs';

/**
 * Eyes in a fight: what an awakened bloodline (or a transplanted eye) brings beyond reading foes
 * (`insight`, read in `plan/sight.ts` and `plan/intent.ts`). **Foresight** reads movement before
 * it happens: attacks are slipped and countered more often, techniques are seen coming, and
 * between rounds its owner keeps the defence that best meets what they've been thrown, as a foe
 * would. **Mimicry** copies a technique watched being used: one the copier's own art could carry
 * (`COPY_SKILL_SHARE` of the user's), of no clan, needing no nature they lack, never a trump, a
 * combination or a ladder art, and at most `MAX_COPIES` a fight.
 */

/** Foresight makes a slip this much likelier… */
export const FORESIGHT_SLIP = 1.4;
/** …a technique this much likelier to be seen coming… */
export const FORESIGHT_SEES = 1.35;
/** …and a Counter this much likelier to find its moment. */
export const FORESIGHT_COUNTER = 1.3;

/** A copy needs the copier's art at least this share of the user's. */
export const COPY_SKILL_SHARE = 0.7;
/** Techniques one fighter copies in a fight, at most. */
export const MAX_COPIES = 2;

interface Eyed {
  readonly perks: readonly CombatPerk[];
}

/** A chance as foresight changes it: scaled for its owner, never past `ceiling`. */
export function foreseen(chance: number, f: Eyed, { scale, ceiling }: Foresight): number {
  return f.perks.includes('foresight') ? Math.min(ceiling, chance * scale) : chance;
}

/** How foresight bends one chance. */
export interface Foresight {
  readonly scale: number;
  readonly ceiling: number;
}

/** Someone who might copy a technique. */
export interface Copier extends Eyed {
  readonly attributes: CombatAttributes;
  readonly techniques: readonly Pick<CombatTechnique, 'id'>[];
  readonly nature?: CombatTechnique['element'];
  /** Techniques already copied this fight. */
  readonly copied?: readonly string[];
}

function copyable(t: CombatTechnique, copier: Copier): boolean {
  if (!isHarmful(t) || t.oncePerFight || t.combo || t.needsOpen || t.clan) return false;
  const nature = t.needs?.nature;
  return nature === undefined || nature === copier.nature;
}

/** Whether `copier` takes `t` for their own, watching `user` use it. */
export function canCopy(
  copier: Copier,
  user: { readonly attributes: CombatAttributes },
  t: CombatTechnique,
): boolean {
  if (!copier.perks.includes('mimicry') || !copyable(t, copier)) return false;
  if (copier.techniques.some((k) => k.id === t.id)) return false;
  if ((copier.copied?.length ?? 0) >= MAX_COPIES) return false;
  return copier.attributes[t.discipline] >= user.attributes[t.discipline] * COPY_SKILL_SHARE;
}
