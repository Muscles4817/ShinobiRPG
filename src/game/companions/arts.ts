import type { CompanionKindDef, KindTechnique } from '@/content';
import { stageOf } from '@/systems/bonds';
import type { Companion } from '@/systems/companions';
import type { MissionRole } from '@/systems/missions';

/**
 * What the bond opens (`docs/design/retinue-plan.md`, slice 2d): a kind's techniques, each at a
 * bond stage (and a handler's teaching, for the deeper ones), and the checks on a job it can take
 * for you once you are close (a tracker follows the trail with its nose).
 */

/** The bond stage at which it takes a job's checks for you in the roles its kind has. */
export const ROLE_STAGE = 3;

/** Whether it knows a kind technique: the bond is there, and a handler taught it if it must. */
export function knowsTechnique(companion: Companion, technique: KindTechnique): boolean {
  const close = stageOf(companion.bond) >= technique.stage;
  return close && (!technique.handler || companion.learned.includes(technique.techniqueId));
}

/** The techniques it fights with now. */
export function knownTechniques(companion: Companion, kind: CompanionKindDef): string[] {
  return (kind.techniques ?? [])
    .filter((t) => knowsTechnique(companion, t))
    .map((t) => t.techniqueId);
}

/** Whether it takes a job's checks for you in this role. */
export function takesRole(
  companion: Companion,
  kind: CompanionKindDef,
  role: MissionRole,
): boolean {
  return (kind.roles ?? []).includes(role) && stageOf(companion.bond) >= ROLE_STAGE;
}
