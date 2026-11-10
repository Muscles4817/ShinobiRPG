import { gradeValue } from '@/content';
import { STAT_GRADES, statTier, type StatGrade } from '@/systems/stats';
import { knows, type TechniqueDef } from '@/systems/techniques';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * Fitted seals (`docs/design/retinue-plan.md`, step 5b-ii): a ninjutsu or genjutsu technique of
 * your own sealed into a puppet's slot, so the puppet can cast it. Fitting one asks your
 * fūinjutsu at the technique's rank, and the art goes no further in the puppet than a grade
 * below your fūinjutsu when it was fitted (and its master's threads, as ever, work it no further
 * than their chakra control).
 */

/** Ryo of inks and paper a seal takes. */
export const SEAL_RYO = 30;
/** The arts a seal can carry. */
const SEALED_ARTS: readonly TechniqueDef['discipline'][] = ['ninjutsu', 'genjutsu'];

function sealingGrade(state: GameState): StatGrade {
  return statTier(state.character.stats.fuuinjutsu).grade;
}

/** How far a sealed art goes in a puppet, by your fūinjutsu now: a grade below it. */
export function sealCap(state: GameState): number {
  const index = STAT_GRADES.indexOf(sealingGrade(state));
  return gradeValue(STAT_GRADES[Math.max(0, index - 1)] ?? 'E');
}

/** Why you can't seal this technique into a puppet, or null. */
export function sealBlocker(state: GameState, technique: TechniqueDef): string | null {
  if (!knows(state.techniques, technique.id)) return 'You don’t know it.';
  if (!SEALED_ARTS.includes(technique.discipline)) return 'Only ninjutsu and genjutsu seal.';
  if (technique.effects.some((e) => e.verb === 'summon')) return 'A summoning won’t seal.';
  const yours = STAT_GRADES.indexOf(sealingGrade(state));
  return yours >= STAT_GRADES.indexOf(technique.rank)
    ? null
    : `Sealing a ${technique.rank}-rank technique asks for fūinjutsu at ${technique.rank}.`;
}

/** Your techniques a seal could carry, and why any can't yet. */
export function sealCandidates(
  state: GameState,
  ctx: GameContext,
): { readonly technique: TechniqueDef; readonly blocker: string | null }[] {
  return state.techniques.known
    .flatMap((id) => ctx.content.techniques.get(id) ?? [])
    .filter(
      (t) => SEALED_ARTS.includes(t.discipline) && !t.effects.some((e) => e.verb === 'summon'),
    )
    .map((technique) => ({ technique, blocker: sealBlocker(state, technique) }));
}

/** What is wrong with these seals, or null. */
export function sealsProblem(
  state: GameState,
  ctx: GameContext,
  seals: readonly string[],
): string | null {
  if (new Set(seals).size !== seals.length) return 'Seal each technique once.';
  for (const id of seals) {
    const technique = ctx.content.techniques.get(id);
    const blocker = technique ? sealBlocker(state, technique) : 'No such technique.';
    if (blocker) return blocker;
  }
  return null;
}
