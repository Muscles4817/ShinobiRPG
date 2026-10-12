import type { PersonDef } from '@/content';
import { stageName, stageOf } from '@/systems/bonds';
import { STAT_GRADES, STAT_IDS, statTier, type StatGrade, type Stats } from '@/systems/stats';

import type { GameContext } from '../context';
import { bondOf, everyone, findPerson, requirePerson } from '../people/cast';
import { personStats } from '../people/progress';
import type { GameState } from '../state';

/**
 * Who may sit an exam. Your sensei nominates you: they must trust you (a bond stage) and judge
 * you ready (some grades at chūnin level, the rest of you not left behind), and you need a
 * record of jobs done. You sit as a team of three: a teammate who isn't ready or willing can be
 * replaced by another genin who is, but only if your sensei tolerates it, and the one left out
 * takes it hard.
 */

/** Your sensei must count you at least a friend before they put your name forward. */
export const NOMINATION_BOND_STAGE = 2;
/** Jobs done before a sensei will nominate you. */
export const NOMINATION_MISSIONS = 10;
/** Readiness: at least this many stats at C (chūnin grade)… */
export const READY_AT_C = 1;
/** …and at least this many at D or better. */
export const READY_AT_D = 3;
/** A teammate sits with you once they count you at least this. */
export const TEAMMATE_WILLING_STAGE = 1;
/** A replacement must be a friend, to go into an exam with you. */
export const REPLACEMENT_STAGE = 2;
/** Bond lost with the teammate you leave out. */
export const REPLACEMENT_BOND_HIT = 25;

/** One genin sitting in for a teammate. */
export interface Replacement {
  readonly leaving: string;
  readonly joining: string;
}

function atLeast(stats: Stats, grade: StatGrade): number {
  const floor = STAT_GRADES.indexOf(grade);
  return STAT_IDS.filter((id) => STAT_GRADES.indexOf(statTier(stats[id]).grade) >= floor).length;
}

/** What a sensei would say is missing before they call someone ready, or null when ready. */
export function readinessGap(stats: Stats): string | null {
  if (atLeast(stats, 'C') < READY_AT_C) return 'a stat at chūnin grade (C)';
  if (atLeast(stats, 'D') < READY_AT_D) return `${READY_AT_D} stats at D or better`;
  return null;
}

export function senseiOf(state: GameState, ctx: GameContext): PersonDef | null {
  const id = state.people.team?.senseiId;
  return id ? (findPerson(state, ctx, id) ?? null) : null;
}

/** Why your sensei won't nominate you yet, or null when they will. */
export function nominationBlocker(state: GameState, ctx: GameContext): string | null {
  const sensei = senseiOf(state, ctx);
  if (!sensei) return 'You need a sensei to nominate you.';
  const name = sensei.name;
  if (stageOf(bondOf(state, sensei.id).points) < NOMINATION_BOND_STAGE) {
    return `${name} doesn’t know you well enough to vouch for you. Be at least ${stageName(NOMINATION_BOND_STAGE).toLowerCase()}s.`;
  }
  const gap = readinessGap(state.character.stats);
  if (gap) return `${name} doesn’t think you’re ready. You need ${gap}.`;
  const done = state.standing.missionsCompleted;
  if (done < NOMINATION_MISSIONS) {
    return `${name} wants to see more of your work first: ${NOMINATION_MISSIONS} jobs done, you have ${done}.`;
  }
  return null;
}

/** A teammate's standing for the exam: why they can't or won't sit it, or null when they will. */
export function teammateBlocker(state: GameState, person: PersonDef): string | null {
  const gap = readinessGap(personStats(person, state));
  if (gap) return `${person.name} isn’t ready: they need ${gap}.`;
  if (stageOf(bondOf(state, person.id).points) < TEAMMATE_WILLING_STAGE) {
    return `${person.name} won’t sit it with someone they barely know.`;
  }
  return null;
}

/** Whether your sensei lets another genin sit in for a teammate. */
export function toleratesReplacement(state: GameState, ctx: GameContext): boolean {
  return senseiOf(state, ctx)?.sensei?.toleratesReplacement === true;
}

/** Genin who could sit in for a teammate: ready, friends with you, and not on your team. */
export function replacementCandidates(state: GameState, ctx: GameContext): PersonDef[] {
  const team = new Set(state.people.team?.teammateIds ?? []);
  return everyone(state, ctx).filter(
    (p) =>
      p.role === 'genin' &&
      !team.has(p.id) &&
      stageOf(bondOf(state, p.id).points) >= REPLACEMENT_STAGE &&
      readinessGap(personStats(p, state)) === null,
  );
}

/** The two genin who would sit with you, after any replacements. */
export function sittingTeam(state: GameState, replacements: readonly Replacement[]): string[] {
  return (state.people.team?.teammateIds ?? []).map(
    (id) => replacements.find((r) => r.leaving === id)?.joining ?? id,
  );
}

function replacementBlocker(
  state: GameState,
  ctx: GameContext,
  r: Replacement,
): string | null {
  const leaving = requirePerson(state, ctx, r.leaving);
  if (!teammateBlocker(state, leaving)) return `${leaving.name} is ready to sit it with you.`;
  if (!replacementCandidates(state, ctx).some((p) => p.id === r.joining)) {
    return 'They can’t sit in for a teammate.';
  }
  return null;
}

/** Why your team can't sit the exam as it stands (with these replacements), or null. */
export function teamBlocker(
  state: GameState,
  ctx: GameContext,
  replacements: readonly Replacement[],
): string | null {
  const team = state.people.team?.teammateIds ?? [];
  if (replacements.some((r) => !team.includes(r.leaving))) return 'That isn’t your teammate.';
  if (new Set(replacements.map((r) => r.joining)).size < replacements.length) {
    return 'One genin can’t sit in for two.';
  }
  if (replacements.length > 0 && !toleratesReplacement(state, ctx)) {
    return `${senseiOf(state, ctx)?.name ?? 'Your sensei'} won’t hear of it: a team is a team.`;
  }
  for (const r of replacements) {
    const blocker = replacementBlocker(state, ctx, r);
    if (blocker) return blocker;
  }
  for (const id of sittingTeam(state, replacements)) {
    const blocker = teammateBlocker(state, requirePerson(state, ctx, id));
    if (blocker) return blocker;
  }
  return null;
}
