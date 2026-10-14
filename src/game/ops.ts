import type { LocationDef, PlaceDef, PlaceKind } from '@/content';
import { write, type ChipTone, type JournalChip, type NewEntry } from '@/systems/journal';
import { STAT_INFO, type StatDelta, type StatId } from '@/systems/stats';
import { advanceSlots } from '@/systems/time';
import { adjustVitals, MAX_HEALTH, passTime, type VitalsDelta } from '@/systems/vitals';

import { boardFor } from './board';
import type { GameContext } from './context';
import { healInjuries } from './injuries';
import { peopleGrown } from './people/progress';
import { characterModifiers } from './profile';
import { snackAt } from './snacks';
import type { GameState } from './state';

/**
 * Small state-transition helpers shared by action handlers. Each returns a new state;
 * none of them validate — validation lives in each handler's `check`.
 */

export function spendTime(state: GameState, slots: number, ctx: GameContext): GameState {
  if (slots <= 0) return state;
  const { character } = state;
  const { hungerRate } = characterModifiers(character, ctx);
  const time = advanceSlots(state.time, slots);
  const { snack: _snack, ...rest } = character;
  const snack = snackAt(character.snack, time);
  const passed: GameState = {
    ...state,
    time,
    character: {
      ...rest,
      vitals: passTime(character.vitals, slots, character.stats, hungerRate),
      // A home-cooked meal's buff lasts until the day ends; a snack's only a little while.
      meal: time.day === state.time.day ? character.meal : null,
      ...(snack ? { snack } : {}),
    },
  };
  const newDay = time.day !== state.time.day;
  const healed = newDay ? healInjuries(passed, ctx) : passed;
  const grown = newDay ? { ...healed, people: peopleGrown(healed, ctx) } : healed;
  return { ...grown, board: boardFor(grown, ctx) };
}

export function adjust(state: GameState, delta: VitalsDelta): GameState {
  const { character } = state;
  return {
    ...state,
    character: { ...character, vitals: adjustVitals(character.vitals, delta, character.stats) },
  };
}

export function log(state: GameState, entry: NewEntry): GameState {
  return { ...state, journal: write(state.journal, state.time, entry) };
}

export function chip(label: string, tone: ChipTone): JournalChip {
  return { label, tone };
}

export function statChips(delta: StatDelta, tone: ChipTone = 'gain'): JournalChip[] {
  return (Object.entries(delta) as [StatId, number][]).map(([id, value]) =>
    chip(`${STAT_INFO[id].label} ${value >= 0 ? '+' : ''}${value}`, tone),
  );
}

/** Reason the character can't start a new activity, or null if they're free. */
export function busyReason(state: GameState): string | null {
  if (state.combat) return 'You are in the middle of a fight.';
  if (state.mission)
    return state.mission.journey ? 'You are on the road.' : 'You are on a mission.';
  if (state.exams.run) return 'You are sitting an exam.';
  if (state.exams.ceremony) return 'Your promotion ceremony is waiting.';
  if (state.people.conversation) return 'You are in the middle of a conversation.';
  if (!state.people.team?.senseiId) return 'Your team has not been assigned yet.';
  if (!state.character.natureKnown) return 'Your sensei is waiting with the chakra paper.';
  return null;
}

export function healthFraction(state: GameState): number {
  return state.character.vitals.health / MAX_HEALTH;
}

/** Composes blocker checks: returns the first non-null reason. */
export function firstBlocker(...reasons: (string | null | false)[]): string | null {
  for (const reason of reasons) if (reason) return reason;
  return null;
}

export function currentLocation(
  state: Pick<GameState, 'locationId'>,
  ctx: GameContext,
): LocationDef {
  return ctx.content.locations.require(state.locationId);
}

/** Every place of the given kind where the character is. */
export function placesHere<K extends PlaceKind>(
  state: Pick<GameState, 'locationId'>,
  ctx: GameContext,
  kind: K,
): Extract<PlaceDef, { kind: K }>[] {
  return currentLocation(state, ctx).places.filter(
    (p): p is Extract<PlaceDef, { kind: K }> => p.kind === kind,
  );
}

/** The first place of the given kind where the character is, if the location has one. */
export function placeHere<K extends PlaceKind>(
  state: Pick<GameState, 'locationId'>,
  ctx: GameContext,
  kind: K,
): Extract<PlaceDef, { kind: K }> | undefined {
  return currentLocation(state, ctx).places.find(
    (p): p is Extract<PlaceDef, { kind: K }> => p.kind === kind,
  );
}
