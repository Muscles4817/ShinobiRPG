import { encounterApproaches, type Alertness, type ApproachId } from '@/systems/missions';
import { checkChance, fightingPower, type StatId } from '@/systems/stats';

import { enemyStatLine } from '../combatants';
import type { GameContext } from '../context';
import { combatStats } from '../gear';
import { slowestAlong, yourCheckValue } from '../missionRoles';
import { firstBlocker } from '../ops';
import type { GameState } from '../state';
import type { EncounterHere } from './current';
import { groundMeans, stealthOf, toolInPouch } from './means';

/**
 * The ways into an encounter and how each stands for you now: whether it's open (and why not),
 * the stat it tests and the odds. Every number an approach reads is here; `resolve.ts` plays them.
 */

/** How much harder each step of alertness makes slipping by, talking or preparing. */
export const ALERT_STEP: Readonly<Record<Alertness, number>> = { unaware: 0, wary: 2, alert: 5 };
/** Each foe after the first makes them harder to talk round. */
const CROWD_STEP = 1;
/** Reputation points worth one point of willpower when talking. */
export const REPUTATION_PER_POINT = 10;
/** A smoke bomb in the pouch helps you slip by. */
export const SMOKE_SNEAK_BONUS = 3;
/** Ryo per foe to pay them to go away. */
export const BRIBE_PER_FOE = 40;
/** How hard it is to lay the ground before they notice, before alertness. */
export const SET_GROUND_DIFFICULTY = 8;
/** Your fighting power over theirs, as willpower points when frightening them, at most this. */
const MAX_MENACE = 5;
const MENACE_WEIGHT = 10;

export const APPROACH_LABEL: Readonly<Record<ApproachId, string>> = {
  'head-on': 'Go in head-on',
  ambush: 'Ambush them',
  sneak: 'Sneak past',
  talk: 'Talk them down',
  bribe: 'Pay them off',
  intimidate: 'Frighten them off',
  'set-ground': 'Set the ground',
  withdraw: 'Withdraw',
};

/** An approach as it stands now. */
export interface ApproachPlan {
  readonly id: ApproachId;
  readonly label: string;
  /** The stat it tests; null when nothing is rolled. */
  readonly stat: StatId | null;
  readonly chance: number;
  /** Ryo it costs (a bribe). */
  readonly ryo: number;
  /** The teammate who holds the team back (sneaking), when someone does. */
  readonly pace: string | null;
  /** Whether a starting distance is chosen with it (an ambush, a prepared ground). */
  readonly needsRange: boolean;
  readonly blocker: string | null;
}

interface Odds {
  readonly stat: StatId | null;
  readonly chance: number;
  /** The teammate whose pace the roll is made at, when it isn't yours. */
  readonly pace?: string;
}

const CERTAIN: Odds = { stat: null, chance: 1 };

function foeStats(here: EncounterHere) {
  return here.foes.map(enemyStatLine);
}

export function bribeCost(here: EncounterHere): number {
  return BRIBE_PER_FOE * here.foes.length;
}

/** On a team job, the team slips by at the pace of its slowest who won't hang back. */
function sneakOdds(state: GameState, ctx: GameContext, here: EncounterHere): Odds {
  const yours = stealthOf(state, ctx);
  const slowest = slowestAlong(state, ctx);
  const held = slowest !== null && slowest.value < yours.value;
  const stealth = held ? { stat: 'speed' as const, value: slowest.value } : yours;
  const smoke = toolInPouch(state, ctx, 'smoke') ? SMOKE_SNEAK_BONUS : 0;
  const watch = Math.max(...foeStats(here).map((s) => s.perception));
  const difficulty = watch + ALERT_STEP[here.encounter.alertness];
  return {
    stat: stealth.stat,
    chance: checkChance(stealth.value + smoke, difficulty),
    ...(held ? { pace: slowest.name } : {}),
  };
}

function talkOdds(state: GameState, here: EncounterHere): Odds {
  const value = state.character.stats.willpower + state.standing.reputation / REPUTATION_PER_POINT;
  const difficulty =
    here.template.resolve +
    ALERT_STEP[here.encounter.alertness] +
    CROWD_STEP * (here.foes.length - 1);
  return { stat: 'willpower', chance: checkChance(value, difficulty) };
}

function intimidateOdds(state: GameState, ctx: GameContext, here: EncounterHere): Odds {
  const stats = foeStats(here);
  const theirs = Math.max(...stats.map(fightingPower));
  const yours = fightingPower(combatStats(state, ctx));
  const menace = (yours / Math.max(1, theirs) - 1) * MENACE_WEIGHT;
  const value =
    state.character.stats.willpower + Math.max(-MAX_MENACE, Math.min(MAX_MENACE, menace));
  const nerve = Math.max(here.template.resolve, ...stats.map((s) => s.willpower));
  const difficulty = nerve + ALERT_STEP[here.encounter.alertness];
  return { stat: 'willpower', chance: checkChance(value, difficulty) };
}

function groundOdds(state: GameState, ctx: GameContext, here: EncounterHere): Odds {
  const fuuinjutsu = yourCheckValue(state, ctx, 'fuuinjutsu');
  const intellect = yourCheckValue(state, ctx, 'intellect');
  const stat: StatId = fuuinjutsu >= intellect ? 'fuuinjutsu' : 'intellect';
  const difficulty = SET_GROUND_DIFFICULTY + ALERT_STEP[here.encounter.alertness];
  return { stat, chance: checkChance(Math.max(fuuinjutsu, intellect), difficulty) };
}

function oddsOf(state: GameState, ctx: GameContext, here: EncounterHere, id: ApproachId): Odds {
  switch (id) {
    case 'sneak':
      return sneakOdds(state, ctx, here);
    case 'talk':
      return talkOdds(state, here);
    case 'intimidate':
      return intimidateOdds(state, ctx, here);
    case 'set-ground':
      return groundOdds(state, ctx, here);
    case 'head-on':
    case 'ambush':
    case 'bribe':
    case 'withdraw':
      return CERTAIN;
  }
}

function ambushBlocker(here: EncounterHere): string | null {
  if (!here.encounter.known.includes('awareness')) {
    return 'You don’t know whether they’ve noticed you. Watch or sense them first.';
  }
  return here.encounter.alertness === 'unaware'
    ? null
    : 'They’re on guard. No surprising them now.';
}

function blockerOf(
  state: GameState,
  ctx: GameContext,
  here: EncounterHere,
  id: ApproachId,
): string | null {
  const alert = here.encounter.alertness === 'alert';
  const tried = here.encounter.tried.includes(id) && 'You’ve tried that. It won’t work twice.';
  switch (id) {
    case 'ambush':
      return ambushBlocker(here);
    case 'bribe':
      return firstBlocker(
        alert && 'They’re past taking coin now.',
        state.wallet.ryo < bribeCost(here) && `They’d want ${bribeCost(here)} ryo.`,
      );
    case 'set-ground':
      return firstBlocker(
        tried,
        alert && 'They’re watching. No time to prepare the ground.',
        !groundMeans(state, ctx) &&
          'Needs a trap or field technique, or a smoke bomb in your pouch.',
      );
    case 'sneak':
    case 'talk':
    case 'intimidate':
      return firstBlocker(tried);
    case 'head-on':
    case 'withdraw':
      return null;
  }
}

/** Every approach this encounter offers, as it stands for you now. */
export function approachPlans(
  state: GameState,
  ctx: GameContext,
  here: EncounterHere,
): ApproachPlan[] {
  return encounterApproaches(here.stage, here.template).map((id) => {
    const odds = oddsOf(state, ctx, here, id);
    return {
      id,
      label: APPROACH_LABEL[id],
      stat: odds.stat,
      chance: odds.chance,
      ryo: id === 'bribe' ? bribeCost(here) : 0,
      pace: odds.pace ?? null,
      needsRange: id === 'ambush' || id === 'set-ground',
      blocker: blockerOf(state, ctx, here, id),
    };
  });
}
