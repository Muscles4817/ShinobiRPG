import type { PersonDef } from '@/content';
import { addPoints } from '@/systems/bonds';
import type { Effect, MissionRun } from '@/systems/missions';
import type { JournalChip } from '@/systems/journal';

import type { GameContext } from '../context';
import { crewOf } from '../crew';
import { adjust, chip } from '../ops';
import { bondOf, requirePerson } from '../people/cast';
import type { GameState } from '../state';

/**
 * What a story's outcome does to you and the people with you: harm and energy to you, bond
 * with everyone along (not whoever leads), and, once the job is done, moments they will
 * remember and what the village will remember (or count) of it. Returned with the chips that show it, since story
 * text never carries numbers.
 */

export interface Felt {
  readonly state: GameState;
  readonly chips: readonly JournalChip[];
}

function bondEveryone(state: GameState, points: number): GameState {
  const ids = crewOf(state).memberIds;
  if (points === 0 || ids.length === 0) return state;
  const raised = Object.fromEntries(ids.map((id) => [id, addPoints(bondOf(state, id), points)]));
  return { ...state, people: { ...state.people, bonds: { ...state.people.bonds, ...raised } } };
}

function feelOne(felt: Felt, effect: Effect): Felt {
  switch (effect.kind) {
    case 'harm':
      return {
        state: adjust(felt.state, { health: -effect.health }),
        chips: [...felt.chips, chip(`−${effect.health} health`, 'harm')],
      };
    case 'energy':
      return {
        state: adjust(felt.state, { energy: effect.by }),
        chips: [
          ...felt.chips,
          chip(
            `${effect.by > 0 ? '+' : '−'}${Math.abs(effect.by)} energy`,
            effect.by > 0 ? 'gain' : 'cost',
          ),
        ],
      };
    case 'bond':
      return crewOf(felt.state).memberIds.length === 0
        ? felt
        : {
            state: bondEveryone(felt.state, effect.by),
            chips: [
              ...felt.chips,
              chip(
                `${effect.by > 0 ? '+' : ''}${effect.by} crew bond`,
                effect.by > 0 ? 'gain' : 'harm',
              ),
            ],
          };
    case 'world':
    case 'memory':
    case 'tally':
      return { ...felt, state: holdOrKeep(felt.state, effect) };
    case 'mark':
    case 'thread':
    case 'pay':
      return felt;
  }
}

/** What lasts beyond a job: what the village remembers or counts, and memories shared. */
type Lasting = Extract<Effect, { readonly kind: 'world' | 'memory' | 'tally' }>;

/**
 * On a job, what lasts is held until the job is done, so a job failed and taken again leaves
 * nothing of the first try behind (a mark it set, a mercy it counted twice).
 */
function holdOrKeep(state: GameState, effect: Lasting): GameState {
  const run = state.mission;
  if (!run) return keep(state, effect);
  return { ...state, mission: { ...run, held: [...(run.held ?? []), effect] } };
}

function keep(state: GameState, effect: Lasting): GameState {
  switch (effect.kind) {
    case 'world':
      return remember(state, effect.mark);
    case 'memory':
      return shareMemory(state, effect.text);
    case 'tally':
      return count(state, effect.tally, effect.by);
  }
}

/** A job done: what it held for the village and the crew now lasts. */
export function releaseHeld(
  state: GameState,
  run: MissionRun,
): GameState & { readonly mission: MissionRun } {
  const { held = [], ...rest } = run;
  const onJob = { ...state, mission: rest };
  return { ...held.filter(isLasting).reduce<GameState>(keep, onJob), mission: rest };
}

function isLasting(effect: Effect): effect is Lasting {
  return effect.kind === 'world' || effect.kind === 'memory' || effect.kind === 'tally';
}

/** The village remembers something you did (once). */
function remember(state: GameState, mark: string): GameState {
  const { village } = state;
  if (village.marks.includes(mark)) return state;
  return { ...state, village: { ...village, marks: [...village.marks, mark] } };
}

/** The village counts one more of something across jobs (mercy shown, clues found). */
function count(state: GameState, tally: string, by: number): GameState {
  const { village } = state;
  const tallies = { ...village.tallies, [tally]: (village.tallies[tally] ?? 0) + by };
  return { ...state, village: { ...village, tallies } };
}

/** Everyone along will remember this moment with you. */
function shareMemory(state: GameState, text: string): GameState {
  const ids = crewOf(state).memberIds;
  const memories = ids.map((personId) => ({ personId, text, day: state.time.day }));
  return {
    ...state,
    village: { ...state.village, memories: [...state.village.memories, ...memories] },
  };
}

export function feel(state: GameState, effects: readonly Effect[]): Felt {
  return effects.reduce(feelOne, { state, chips: [] });
}

/** Bond with one person along, by `points`. */
export function bondWithOne(state: GameState, personId: string, points: number): GameState {
  const bonds = { ...state.people.bonds, [personId]: addPoints(bondOf(state, personId), points) };
  return { ...state, people: { ...state.people, bonds } };
}

/** Everyone along on the job (leader included), as people. */
export function crewPeople(state: GameState, ctx: GameContext): PersonDef[] {
  const crew = crewOf(state);
  const ids = crew.leaderId ? [...crew.memberIds, crew.leaderId] : crew.memberIds;
  return ids.map((id) => requirePerson(state, ctx, id));
}
