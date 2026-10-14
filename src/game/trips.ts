import type { PersonDef } from '@/content';
import { addPoints, stageOf } from '@/systems/bonds';
import { SOLO, type Crew, type JourneyPlan } from '@/systems/missions';
import { calendarDay } from '@/systems/time';
import { isRentOverdue } from '@/systems/housing';

import { boardFor } from './board';
import type { GameContext } from './context';
import { log } from './ops';
import { bondOf, findPerson, isVillager, villagers, whereNow } from './people/cast';
import { addReport } from './reports';
import type { GameState } from './state';

/**
 * A trip of your own, beyond the road: a friend who comes along (from home, once you're close,
 * if they're about), the day you left, and coming home to what the village did without you.
 * A companion goes where you go, is found at your lodging, and goes home when you do.
 */

/** Bond stage before a friend will come along (2: friends). */
export const COMPANION_STAGE = 2;
/** Bond with your companion for every place you reach together. */
export const TRIP_BOND = 5;
/** Who may leave the village with you: classmates and shinobi, not its leaders or teachers. */
const COMPANION_ROLES: readonly PersonDef['role'][] = ['genin', 'shinobi'];

/** Why this person can't come with you, or null. */
export function companionBlocker(
  state: GameState,
  ctx: GameContext,
  personId: string,
): string | null {
  const person = findPerson(state, ctx, personId);
  if (!person || !isVillager(person, ctx) || !COMPANION_ROLES.includes(person.role))
    return 'They can’t come with you.';
  if (state.locationId !== ctx.content.startLocationId) return 'Friends come along from home.';
  if (state.people.companionId !== null) return 'Someone is already coming with you.';
  if (stageOf(bondOf(state, person.id).points) < COMPANION_STAGE)
    return `You and ${person.name} aren’t close enough for that yet.`;
  return whereNow(state, ctx, person) === null ? `${person.name} is away right now.` : null;
}

/** Friends who would come with you if you set out now. */
export function companionsOnOffer(state: GameState, ctx: GameContext): readonly PersonDef[] {
  return villagers(state, ctx).filter((p) => companionBlocker(state, ctx, p.id) === null);
}

/** Who is along on the road: the friend with you, if any. */
export function tripCrew(companionId: string | null): Crew {
  return companionId === null
    ? SOLO
    : { kind: 'companion', leaderId: null, memberIds: [companionId] };
}

/** Setting out: the day you left home is kept, and a friend asked along comes. */
export function leaving(
  state: GameState,
  ctx: GameContext,
  plan: JourneyPlan,
  companionId: string | null,
): GameState {
  const fromHome = plan.from === ctx.content.startLocationId;
  return {
    ...state,
    leave: fromHome ? { ...state.leave, awaySince: state.time.day } : state.leave,
    people: { ...state.people, companionId: companionId ?? state.people.companionId },
  };
}

/** Arriving: home again (your companion goes home too), or somewhere new together. */
export function arriving(state: GameState, ctx: GameContext, plan: JourneyPlan): GameState {
  if (plan.to === ctx.content.startLocationId) return homeAgain(state, ctx);
  const friend = state.people.companionId;
  if (friend === null) return state;
  const place = ctx.content.locations.require(plan.to).name;
  const bonds = { ...state.people.bonds, [friend]: addPoints(bondOf(state, friend), TRIP_BOND) };
  const memory = { personId: friend, text: `the road to ${place}`, day: state.time.day };
  return {
    ...state,
    people: { ...state.people, bonds },
    village: { ...state.village, memories: [...state.village.memories, memory] },
  };
}

interface HomeNews {
  readonly label: string;
  readonly value: string;
  readonly tone?: 'gain' | 'cost' | 'harm';
}

/** The village's festivals held between leaving and today. */
function festivalsMissed(state: GameState, ctx: GameContext, since: number): string[] {
  // The days wholly away: not the morning you left, nor the one you came back.
  const away = Math.max(0, state.time.day - since - 1);
  const held = Array.from({ length: away }, (_, i) => calendarDay(since + 1 + i));
  return ctx.content.village.festivals
    .filter((f) => f.locationId === undefined || f.locationId === ctx.content.startLocationId)
    .filter((f) => held.some((d) => d.season === f.season && d.day === f.day))
    .map((f) => f.name);
}

function newsSince(state: GameState, ctx: GameContext, since: number): HomeNews[] {
  const home = ctx.content.locations.require(ctx.content.startLocationId);
  const hall = home.places.find((p) => p.kind === 'missions');
  const posted = boardFor(state, ctx).postings.filter(
    (p) =>
      p.postedDay > since && hall?.kind === 'missions' && hall.missionIds.includes(p.missionId),
  ).length;
  return [
    ...(posted > 0 ? [{ label: 'New jobs on the board', value: String(posted) }] : []),
    ...festivalsMissed(state, ctx, since).map((name) => ({ label: 'Missed', value: name })),
    ...(isRentOverdue(state.housing, state.time.day)
      ? [{ label: 'Rent', value: 'Overdue', tone: 'harm' as const }]
      : []),
  ];
}

/** Home: the trip is over, and a card says what the village did while you were gone. */
function homeAgain(state: GameState, ctx: GameContext): GameState {
  const since = state.leave.awaySince;
  const friend = state.people.companionId ? findPerson(state, ctx, state.people.companionId) : null;
  const back: GameState = {
    ...state,
    leave: { ...state.leave, awaySince: null },
    people: { ...state.people, companionId: null },
  };
  if (since === null) return back;
  const home = ctx.content.locations.require(ctx.content.startLocationId).name;
  const days = state.time.day - since;
  const parted = friend
    ? log(back, { text: `${friend.name} heads home. “Same again some time.”`, tone: 'info' })
    : back;
  return addReport(parted, {
    kind: 'home-again',
    place: home,
    days,
    news: newsSince(state, ctx, since),
    text: 'The village carried on without you, as villages do.',
  });
}
