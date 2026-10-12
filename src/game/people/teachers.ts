import type { PersonDef, PriceTemplate, Steering } from '@/content';
import { stageName, stageOf } from '@/systems/bonds';
import { RANKS, type Rank } from '@/systems/standing';
import { STAT_IDS, type StatId } from '@/systems/stats';
import { slotName, TIME_SLOTS, weekOf, type TimeSlot } from '@/systems/time';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { bondOf, whereNow } from './cast';
import { personStats } from './progress';
import { SESSIONS_BY_RANK, teachingFactor, teachingRank } from './teachingFactor';

/**
 * Who can teach you what, and on what terms. Anyone ranked shinobi offers the stats they are
 * ahead of you in. Their `TeacherProfile` (or the defaults: no quirk, no steering, sessions by
 * rank, a bond scaled by their rank above yours) says how often, at what price and whether they
 * choose what you work on. Your own sensei is the special case: no price, and weekly time.
 */

/** Stats someone can train with you. Reserves aren't drilled; they grow with stamina. */
export const TEACHABLE_STATS: readonly StatId[] = STAT_IDS.filter((id) => id !== 'reserves');

/** Bond stage a teacher with no price of their own wants, by ranks above yours. */
const DEFAULT_BOND_BY_GAP = [1, 2, 3, 4] as const;

/** Someone's terms as a teacher, resolved for you. */
export interface Teaching {
  readonly person: PersonDef;
  readonly isSensei: boolean;
  /** Rank × quirk. */
  readonly factor: number;
  readonly sessionsPerWeek: number;
  /** Null when there is nothing to pay (your sensei). */
  readonly price: PriceTemplate | null;
  readonly steers: Steering | null;
  readonly teaches: readonly string[];
}

function rankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}

/** The bond a teacher without a price of their own asks, by rank relative to yours. */
function defaultPrice(state: GameState, person: PersonDef): PriceTemplate {
  const rank = teachingRank(person) ?? 'genin';
  const gap = Math.max(0, rankIndex(rank) - rankIndex(state.standing.rank));
  const minStage = DEFAULT_BOND_BY_GAP[Math.min(gap, DEFAULT_BOND_BY_GAP.length - 1)] ?? 1;
  return { kind: 'bond', minStage };
}

export function isYourSensei(state: GameState, personId: string): boolean {
  return state.people.team?.senseiId === personId;
}

/** Someone's terms as your teacher; null for civilians, who don't teach. */
export function teachingOf(state: GameState, person: PersonDef): Teaching | null {
  const rank = teachingRank(person);
  if (!rank) return null;
  const profile = person.teacher;
  const isSensei = isYourSensei(state, person.id);
  return {
    person,
    isSensei,
    factor: teachingFactor(person),
    sessionsPerWeek: profile?.sessionsPerWeek ?? SESSIONS_BY_RANK[rank],
    price: isSensei ? null : (profile?.price ?? defaultPrice(state, person)),
    steers: profile?.steers ?? null,
    teaches: profile?.teaches ?? [],
  };
}

/** Stats this person is ahead of you in, in stat order. */
export function aheadIn(state: GameState, person: PersonDef): StatId[] {
  const theirs = personStats(person, state);
  const yours = state.character.stats;
  return TEACHABLE_STATS.filter((id) => theirs[id] > yours[id]);
}

/** A stat you know will never take: no teacher can help with it. */
function knownVoid(state: GameState, stat: StatId): boolean {
  const { aptitude, aptitudeKnown } = state.character;
  return aptitudeKnown[stat] !== 'unknown' && aptitude[stat] <= 0;
}

/**
 * The stat a steering teacher puts you to work on today, or null when they let you choose (or
 * have nothing they could teach you).
 */
export function steeredStat(state: GameState, teaching: Teaching): StatId | null {
  const { steers, person } = teaching;
  if (!steers || stageOf(bondOf(state, person.id).points) >= steers.freeAtStage) return null;
  const options = aheadIn(state, person).filter((id) => !knownVoid(state, id));
  if (steers.focus === 'specialty' && person.specialty && options.includes(person.specialty)) {
    return person.specialty;
  }
  const yours = state.character.stats;
  return options.reduce<StatId | null>(
    (low, id) => (low && yours[low] <= yours[id] ? low : id),
    null,
  );
}

/** "until you are friends": when a steering teacher will let you choose. */
export function steeringNote(teaching: Teaching): string | null {
  const free = teaching.steers?.freeAtStage;
  if (free === undefined) return null;
  return `${teaching.person.name} decides what you work on until you are ${stageName(free).toLowerCase()}s.`;
}

/** Sessions this teacher has given you this week. */
export function sessionsUsed(state: GameState, personId: string): number {
  const record = state.people.taught[personId];
  return record?.week === weekOf(state.time.day) ? record.used : 0;
}

export function taughtToday(state: GameState, personId: string): boolean {
  return state.people.taught[personId]?.lastDay === state.time.day;
}

/** The record after one more session today. */
export function withSession(state: GameState, personId: string): GameState['people']['taught'] {
  const week = weekOf(state.time.day);
  const used = sessionsUsed(state, personId) + 1;
  return { ...state.people.taught, [personId]: { week, used, lastDay: state.time.day } };
}

/** Your sensei makes time for you at the training ground whenever they're in the village by day. */
const SENSEI_COMES_UNTIL: TimeSlot = 'evening';

/** Whether this person can train with you at `placeId` right now. */
export function presentFor(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  placeId: string,
): boolean {
  const where = whereNow(state, ctx, person);
  if (where === placeId) return true;
  const byDay = TIME_SLOTS.indexOf(slotName(state.time)) <= TIME_SLOTS.indexOf(SENSEI_COMES_UNTIL);
  return where !== null && byDay && isYourSensei(state, person.id);
}
