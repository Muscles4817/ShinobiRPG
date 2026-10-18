import type { PersonDef } from '@/content';
import { fillSlots } from '@/core';
import { BOND_STAGES, stageName, stageOf, stageProgress } from '@/systems/bonds';

import { PASS_BOND_STAGE } from '../leave';
import { PERMIT_BOND_STAGE } from '../permits';
import { bondOf } from '../people/cast';
import { priceParts } from '../people/price';
import { personSlots } from '../people/pronouns';
import { TEACHES_AT_STAGE } from '../people/signatures';
import { teachingOf } from '../people/teachers';
import { waysOf } from '../sensei/generate';
import type { GameState } from '../state';

/**
 * Where you stand with someone, and what getting closer opens next: read from the rules that
 * open it (when you learn their traits and tastes, when a teacher starts on their own
 * techniques, stops choosing your drills or asks no more than your friendship, when your
 * sensei signs a pass or a permit, eases off, or tells you more of their story). What the
 * sheet promises is what the game does.
 */

/** Stage at which you learn someone's traits, and then what they like to hear. */
export const TRAITS_REVEALED_AT = 1;
export const TASTES_REVEALED_AT = 2;

export interface BondStep {
  readonly name: string;
  /** What reaching it opens, in a line each; empty when it opens nothing new. */
  readonly opens: readonly string[];
}

export interface BondPath {
  readonly stage: number;
  readonly name: string;
  /** Progress through the current stage, 0–1. */
  readonly progress: number;
  /** The stage after this one, or null at the closest there is. */
  readonly next: BondStep | null;
}

interface Unlock {
  readonly stage: number;
  readonly line: string;
}

function teacherUnlocks(state: GameState, person: PersonDef): Unlock[] {
  const teaching = teachingOf(state, person);
  if (!teaching) return [];
  const bondPrice = teaching.price
    ? priceParts(teaching.price).flatMap((p) => (p.kind === 'bond' ? [p.minStage] : []))
    : [];
  return [
    ...bondPrice.map((stage) => ({ stage, line: '{p.they}’ll train you.' })),
    ...(teaching.steers
      ? [
          {
            stage: teaching.steers.freeAtStage,
            line: '{p.they} let{p.s} you choose what to train.',
          },
        ]
      : []),
    ...(teaching.teaches.length > 0
      ? [
          {
            stage: TEACHES_AT_STAGE,
            line: '{p.they} start{p.s} teaching you {p.their} own techniques.',
          },
        ]
      : []),
  ];
}

function senseiUnlocks(state: GameState, person: PersonDef): Unlock[] {
  if (state.people.team?.senseiId !== person.id) return [];
  const ways = waysOf(person);
  const beats = ways?.story.beats ?? [];
  return [
    {
      stage: ways?.gatekeeping.passStage ?? PASS_BOND_STAGE,
      line: '{p.they} sign{p.s} your travel pass.',
    },
    {
      stage: ways?.gatekeeping.permitStage ?? PERMIT_BOND_STAGE,
      line: '{p.they} sign{p.s} your library permit.',
    },
    ...(ways
      ? [{ stage: ways.loosensAtStage, line: '{p.they} ease{p.s} off your week a little.' }]
      : []),
    ...beats.map((_, i) => ({
      stage: i + 1,
      line: '{p.they} tell{p.s} you more of {p.their} story.',
    })),
  ];
}

/** Everything getting closer to this person opens, by stage, in words that agree with them. */
function unlocks(state: GameState, person: PersonDef): Unlock[] {
  const slots = personSlots('p', person);
  return [
    { stage: TRAITS_REVEALED_AT, line: "You learn what {p.they}{p.'s} like." },
    { stage: TASTES_REVEALED_AT, line: 'You learn what {p.they} like{p.s} to hear.' },
    ...teacherUnlocks(state, person),
    ...senseiUnlocks(state, person),
  ].map((u) => ({ ...u, line: fillSlots(u.line, slots) }));
}

export function bondPath(state: GameState, person: PersonDef): BondPath {
  const points = bondOf(state, person.id).points;
  const stage = stageOf(points);
  const nextStage = stage + 1;
  const opens = [
    ...new Set(unlocks(state, person).flatMap((u) => (u.stage === nextStage ? [u.line] : []))),
  ];
  return {
    stage,
    name: stageName(stage),
    progress: stageProgress(points),
    next: nextStage < BOND_STAGES.length ? { name: stageName(nextStage), opens } : null,
  };
}
