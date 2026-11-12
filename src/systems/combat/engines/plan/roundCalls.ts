import type { StatGrade } from '@/systems/stats';

import { alive } from '../../rules/body';
import { isPinned } from '../../rules/verbs';
import { gradeOf } from './judgement';
import { killerOf } from './survival';
import { CALL_TRIGGERS, type CallTrigger } from './roundCallShape';
import { playerOf, type PlanFighter, type PlanState } from './state';

/**
 * Mid-round calls (audit P2.1, the owner's choice: trigger calls). The round stops early at the
 * card table when something happens the player would want to answer, each kind once a fight:
 * a foe brings in a new body (a summons, a puppet, a clone that fights), a foe shows a technique
 * not seen before (from the second round, when the opening's reveals are done), you are dazed,
 * pinned or sealed, your health falls under a third, a killer comes for you, or a teammate falls.
 * On top of those, a few calls of your own a fight by intellect (`FREE_CALLS`): stop and re-plan
 * whenever you like. The round keeps its exchanges; playing on picks up where it stopped. Only
 * a fight someone plans for stops: a watched one plays straight through.
 */

/** Calls of your own a fight, by intellect grade: a sharper mind stops to think more often. */
export const FREE_CALLS: Readonly<Record<StatGrade, number>> = {
  E: 1,
  D: 1,
  C: 2,
  B: 2,
  A: 3,
  S: 3,
};

/** Your health under this share stops the round once. */
export const CALL_HEALTH_SHARE = 1 / 3;

/** What the plan screen says stopped the round, in words. */
export const CALLED_FOR: Readonly<Record<CallTrigger | 'own', string>> = {
  summoned: 'Something new has joined their side.',
  revealed: 'They have shown a technique you hadn’t seen.',
  held: 'You are caught: dazed, held or sealed.',
  hurt: 'You are badly hurt.',
  killer: 'Something coming could end you.',
  'ally-down': 'One of your side has fallen.',
  own: 'You stopped to think.',
};

const isFoe = (f: PlanFighter) => f.side === 'enemy' && alive(f);

function summoned(before: PlanState, after: PlanState): boolean {
  const had = new Set(before.fighters.filter(isFoe).map((f) => f.id));
  return after.fighters.some((f) => isFoe(f) && !had.has(f.id));
}

function revealed(before: PlanState, after: PlanState): boolean {
  if (after.bout < 2) return false;
  return after.fighters.filter(isFoe).some((f) => {
    const was = new Set(before.seen[f.id] ?? []);
    return (after.seen[f.id] ?? []).some((id) => id.startsWith('jutsu:') && !was.has(id));
  });
}

function caught(f: PlanFighter): boolean {
  return f.stunned > 0 || f.sealed > 0 || isPinned(f);
}

function held(before: PlanState, after: PlanState): boolean {
  return caught(playerOf(after)) && !caught(playerOf(before));
}

function hurt(before: PlanState, after: PlanState): boolean {
  const low = (f: PlanFighter) => f.health < f.maxHealth * CALL_HEALTH_SHARE;
  return low(playerOf(after)) && !low(playerOf(before));
}

function killer(_before: PlanState, after: PlanState): boolean {
  const moment = {
    fighters: after.fighters,
    range: after.range,
    intents: after.intents,
    number: after.round,
  };
  return killerOf(playerOf(after), moment) !== undefined;
}

function allyDown(before: PlanState, after: PlanState): boolean {
  const ally = (f: PlanFighter) => f.side === 'player' && !f.isPlayer && f.shadowOf === undefined;
  const up = new Set(before.fighters.filter((f) => ally(f) && alive(f)).map((f) => f.id));
  return after.fighters.some((f) => up.has(f.id) && !alive(f));
}

const DETECT: Readonly<Record<CallTrigger, (before: PlanState, after: PlanState) => boolean>> = {
  summoned,
  revealed,
  held,
  hurt,
  killer,
  'ally-down': allyDown,
};

/** Whether this fight stops for calls at all: someone plans for it, and it is still going. */
function callable(after: PlanState): boolean {
  return after.watching !== true && !after.result && after.phase === 'fight' && after.exchange > 0;
}

/**
 * After an exchange: the round stops at the card table if something called for it that hasn't
 * this fight, the exchange counter kept so playing on finishes the round.
 */
export function calledBack(before: PlanState, after: PlanState): PlanState {
  if (!callable(after) || !alive(playerOf(after))) return after;
  const fired = after.calls?.fired ?? [];
  const trigger = CALL_TRIGGERS.find((t) => !fired.includes(t) && DETECT[t](before, after));
  if (!trigger) return after;
  return {
    ...after,
    phase: 'loadout',
    called: trigger,
    calls: { ...after.calls, fired: [...fired, trigger] },
  };
}

/** Calls of your own left this fight. */
export function ownCallsLeft(state: PlanState): number {
  return FREE_CALLS[gradeOf(playerOf(state))] - (state.calls?.own ?? 0);
}

/** You stop the round to re-plan, spending one of your own calls. */
export function callOwn(state: PlanState): PlanState {
  return {
    ...state,
    phase: 'loadout',
    called: 'own',
    calls: { ...state.calls, own: (state.calls?.own ?? 0) + 1 },
  };
}
