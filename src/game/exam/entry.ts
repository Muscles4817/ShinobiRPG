import type { NominationHabit, PersonDef } from '@/content';
import { fillSlots } from '@/core';
import { stageForPair, stageOf } from '@/systems/bonds';
import {
  STAT_GRADES,
  STAT_IDS,
  STAT_READING,
  statTier,
  type StatGrade,
  type Stats,
} from '@/systems/stats';

import type { GameContext } from '../context';
import { bondOf, findPerson, requirePerson, villagers } from '../people/cast';
import { personStats } from '../people/progress';
import { personSlots } from '../people/pronouns';
import type { GameState } from '../state';
import { waysOf } from '../sensei/generate';

/**
 * Who may sit an exam. Your sensei nominates you: they must trust you (a bond stage) and judge
 * you ready (some grades at chūnin level, the rest of you not left behind), and you need a
 * record of jobs done. You sit as a team of three: a teammate who isn't ready or willing can be
 * replaced by another genin who is, but only if your sensei tolerates it, and the one left out
 * takes it hard.
 */

/** Your sensei must count you at least a friend before they put your name forward. */
export const NOMINATION_BOND_STAGE = 2;
/** Jobs done before a sensei will nominate you, by how soon they put students forward. */
export const NOMINATION_MISSIONS: Readonly<Record<NominationHabit, number>> = {
  early: 8,
  usual: 10,
  late: 13,
};

/** Jobs this sensei wants to see done before they nominate you. */
export function nominationMissions(sensei: PersonDef): number {
  return NOMINATION_MISSIONS[waysOf(sensei)?.gatekeeping.nominates ?? 'usual'];
}
/** Your sensei must rate you at least this (`game/sensei/state.ts`): kept sessions earn it. */
export const NOMINATION_REGARD = 40;
/**
 * Readiness reads skills only (the arts and chakra control): a sharp mind or a fast body is not
 * chūnin work. A sensei calls a genin ready once one of their skills reaches C, the ordinary
 * chūnin's grade in their art; a specialist is as ready as an all-rounder.
 */
export const READY_GRADE: StatGrade = 'C';
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

const SKILLS = STAT_IDS.filter((id) => STAT_READING[id] === 'skill');

function hasSkillAt(stats: Stats, grade: StatGrade): boolean {
  const floor = STAT_GRADES.indexOf(grade);
  return SKILLS.some((id) => STAT_GRADES.indexOf(statTier(stats[id]).grade) >= floor);
}

/** What a sensei would say is missing before they call someone ready, or null when ready. */
export function readinessGap(stats: Stats): string | null {
  return hasSkillAt(stats, READY_GRADE) ? null : 'a skill at chūnin level (C)';
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
    return `${name} doesn’t know you well enough to vouch for you. Be at least ${stageForPair(NOMINATION_BOND_STAGE)}.`;
  }
  if (state.mentor.regard < NOMINATION_REGARD) {
    return fillSlots(
      '{sensei} isn’t sure you take this seriously. Keep the sessions {sensei.they} set{sensei.s} you.',
      personSlots('sensei', sensei),
    );
  }
  const gap = readinessGap(state.character.stats);
  if (gap) return `${name} doesn’t think you’re ready. You need ${gap}.`;
  const done = state.standing.missionsCompleted;
  const wanted = nominationMissions(sensei);
  if (done < wanted) {
    return `${name} wants to see more of your work first: ${wanted} jobs done, you have ${done}.`;
  }
  return null;
}

/** A teammate's standing for the exam: why they can't or won't sit it, or null when they will. */
export function teammateBlocker(state: GameState, person: PersonDef): string | null {
  const gap = readinessGap(personStats(person, state));
  const slots = { ...personSlots('mate', person), gap: gap ?? '' };
  if (gap) return fillSlots('{mate} isn’t ready: {mate.they} need{mate.s} {gap}.', slots);
  if (stageOf(bondOf(state, person.id).points) < TEAMMATE_WILLING_STAGE) {
    return fillSlots('{mate} won’t sit it with someone {mate.they} barely know{mate.s}.', slots);
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
  return villagers(state, ctx).filter(
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

function replacementBlocker(state: GameState, ctx: GameContext, r: Replacement): string | null {
  const leaving = requirePerson(state, ctx, r.leaving);
  if (!teammateBlocker(state, leaving)) return `${leaving.name} is ready to sit it with you.`;
  if (!replacementCandidates(state, ctx).some((p) => p.id === r.joining)) {
    const joining = findPerson(state, ctx, r.joining);
    return `${joining?.name ?? 'They'} can’t sit in for a teammate.`;
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
