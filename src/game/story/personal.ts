import type { PersonDef } from '@/content';
import { addPoints } from '@/systems/bonds';
import type { Effect } from '@/systems/missions';
import type { JournalChip } from '@/systems/journal';

import type { GameContext } from '../context';
import { crewOf } from '../crew';
import { adjust, chip } from '../ops';
import { bondOf, requirePerson } from '../people/cast';
import type { GameState } from '../state';

/**
 * What a story's outcome does to you and the people with you: harm and energy to you, bond
 * with everyone along (not whoever leads), moments they will remember, and what the village
 * will remember of the job. Returned with the chips that show it, since story
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
      return { ...felt, state: remember(felt.state, effect.mark) };
    case 'memory':
      return { ...felt, state: shareMemory(felt.state, effect.text) };
    case 'mark':
    case 'thread':
    case 'pay':
      return felt;
  }
}

/** The village remembers something you did (once). */
function remember(state: GameState, mark: string): GameState {
  const { village } = state;
  if (village.marks.includes(mark)) return state;
  return { ...state, village: { ...village, marks: [...village.marks, mark] } };
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
