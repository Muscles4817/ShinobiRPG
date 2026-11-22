import type { LocationDef, PlaceDef, PlaceKind } from '@/content';
import { write, type ChipTone, type JournalChip, type NewEntry } from '@/systems/journal';
import { STAT_INFO, type StatDelta, type StatId } from '@/systems/stats';
import { advanceSlots } from '@/systems/time';
import { adjustVitals, MAX_HEALTH, passTime, type VitalsDelta } from '@/systems/vitals';

import { sequenceTime } from './happenings/run';
import { TIME_PASSING } from './happenings/timePassing';
import type { GameContext } from './context';
import { characterModifiers } from './profile';
import { snackAt } from './snacks';
import type { GameState } from './state';
import { chakraBody } from './hives/hive';

export { busyReason } from './busy';

/**
 * Small state-transition helpers shared by action handlers. Each returns a new state;
 * none of them validate — validation lives in each handler's `check`.
 */

export function spendTime(state: GameState, slots: number, ctx: GameContext): GameState {
  if (slots <= 0) return state;
  const { character } = state;
  const { hungerRate } = characterModifiers(character, ctx);
  const time = advanceSlots(state.time, slots);
  const { snack: _snack, soaked, ...rest } = character;
  const snack = snackAt(character.snack, time);
  const newDay = time.day !== state.time.day;
  const passed: GameState = {
    ...state,
    time,
    character: {
      ...rest,
      vitals: passTime(character.vitals, slots, chakraBody(state), hungerRate),
      // A home-cooked meal's buff lasts until the day ends; a snack's only a little while.
      meal: time.day === state.time.day ? character.meal : null,
      ...(snack ? { snack } : {}),
      // Like the meal, a soak's warmth lasts until the day ends.
      ...(soaked && !newDay ? { soaked } : {}),
    },
  };
  // What passing time brings (healing, peers, the board…) is the declared list, in its order.
  const days = time.day - state.time.day;
  return sequenceTime(TIME_PASSING, { ctx, before: state, now: passed, days });
}

export function adjust(state: GameState, delta: VitalsDelta): GameState {
  const { character } = state;
  return {
    ...state,
    character: { ...character, vitals: adjustVitals(character.vitals, delta, chakraBody(state)) },
  };
}

export function log(state: GameState, entry: NewEntry): GameState {
  return { ...state, journal: write(state.journal, state.time, entry) };
}

export function chip(label: string, tone: ChipTone): JournalChip {
  return { label, tone };
}

/**
 * A chip for ryo changing hands: "−12 ryo", "+240 ryo" (with `what` after it: "−30 ryo
 * passage"). It carries the amount itself, so the day's purse never reads it back from words.
 */
export function ryoChip(amount: number, what?: string): JournalChip {
  const sign = amount < 0 ? '−' : '+';
  const label = `${sign}${Math.abs(amount)} ryo${what ? ` ${what}` : ''}`;
  return { label, tone: amount < 0 ? 'cost' : 'gain', ryo: amount };
}

/** Growth below this reads "a touch"; up to a whole point, "a little". */
const TOUCH_BELOW = 0.05;

/**
 * How much a change in a stat reads as, by one rule for every chip: a whole number when it
 * rounds to one or more ("+2"), and a word when it is smaller ("a little", "a touch"), so a
 * chip never shows a fraction or "+0". No change at all is no chip.
 */
export function amountWords(value: number): string | null {
  const whole = Math.round(value);
  if (whole !== 0) return `${whole > 0 ? '+' : '−'}${Math.abs(whole)}`;
  if (value === 0) return null;
  const size = Math.abs(value) < TOUCH_BELOW ? 'a touch' : 'a little';
  return value > 0 ? size : `${size} less`;
}

/** A chip for an amount of something ("Health +12", "Strength, a little"); none for nothing. */
export function amountChip(label: string, value: number, tone: ChipTone): JournalChip[] {
  const words = amountWords(value);
  if (words === null) return [];
  return [chip(/^[+−]/.test(words) ? `${label} ${words}` : `${label}, ${words}`, tone)];
}

export function statChips(delta: StatDelta, tone: ChipTone = 'gain'): JournalChip[] {
  return (Object.entries(delta) as [StatId, number][]).flatMap(([id, value]) =>
    amountChip(STAT_INFO[id].label, value, tone),
  );
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

/**
 * The place of the given kind here that a page was opened for (`placeId`); without one, the
 * first of its kind. A location may have more than one training ground or market, so a page
 * names its own.
 */
export function placeShown<K extends PlaceKind>(
  state: Pick<GameState, 'locationId'>,
  ctx: GameContext,
  kind: K,
  placeId?: string,
): Extract<PlaceDef, { kind: K }> | undefined {
  const places = placesHere(state, ctx, kind);
  return placeId === undefined ? places[0] : places.find((p) => p.id === placeId);
}

/**
 * The first place of the given kind where the character is, if the location has one: for
 * asking whether there is one. A page showing a place uses `placeShown`.
 */
export function placeHere<K extends PlaceKind>(
  state: Pick<GameState, 'locationId'>,
  ctx: GameContext,
  kind: K,
): Extract<PlaceDef, { kind: K }> | undefined {
  return currentLocation(state, ctx).places.find(
    (p): p is Extract<PlaceDef, { kind: K }> => p.kind === kind,
  );
}
