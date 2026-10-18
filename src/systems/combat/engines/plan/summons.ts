import { alive } from '../../rules/body';
import { harmLine } from '../../rules/narration';
import { tell } from '../../rules/telling';
import type { CombatCall, SummonFate } from '../../contract';
import {
  calledFighter,
  fighterIn,
  patch,
  paying,
  say,
  type PlanFighter,
  type Round,
} from './state';

/**
 * Summons in a planned fight (`docs/design/retinue-plan.md`): a summoning technique calls a full
 * body onto its caller's side, in the front row, fighting by its own mind with a plan of its own
 * (`summonPlans.ts`), from the next exchange. Its caller pays any blood price at once and its upkeep in chakra at the
 * end of every exchange it stays. It goes home when they can't pay, when it falls, or when they
 * do; how it went is kept on the caller for the outcome.
 */

type Fighter = PlanFighter;

/** A blood price never takes the caller's last breath. */
const BLOOD_FLOOR = 1;

function summonId(fighters: readonly PlanFighter[], callerId: string, callId: string): string {
  const base = `${callerId}~${callId}`;
  const earlier = fighters.filter((f) => f.id.startsWith(base)).length;
  return earlier === 0 ? base : `${base}~${earlier + 1}`;
}

function summoned(round: Round, caller: Fighter, call: CombatCall): Fighter {
  const body = calledFighter(call.body, caller.side);
  const fighter: Fighter = {
    ...body,
    id: summonId(round.fighters, caller.id, call.id),
    row: 'front',
    summoner: caller.id,
    callId: call.id,
    upkeep: call.upkeep,
  };
  // Its plan is made as the exchange ends, before its first turn (`summonPlans.ts`).
  return fighter;
}

/** The caller's turn on a summoning technique: the body answers, if they hold the call. */
export function callSummon(round: Round, actor: PlanFighter, callId: string): Round {
  const caller: Fighter = actor;
  const call = caller.calls?.find((c) => c.id === callId);
  if (!call || (caller.summonsOut ?? []).includes(callId)) {
    return say(round, tell('{a.their} summoning finds nothing to answer it.', { a: actor }));
  }
  const body = summoned(round, caller, call);
  const blood = Math.min(call.bloodPrice ?? 0, Math.max(0, caller.health - BLOOD_FLOOR));
  const out = [...(caller.summonsOut ?? []), callId];
  const fighters = round.fighters.map((f) =>
    f.id === caller.id ? { ...f, health: f.health - blood, summonsOut: out } : f,
  );
  const answered = say(
    { ...round, fighters: [...fighters, body] },
    tell('{a} slam{a.s} a palm down. Smoke bursts, and {b} answers the call.', {
      a: actor,
      b: body,
    }),
  );
  const paid = harmLine(tell('{a} pay{a.s} in blood.', { a: actor }), blood);
  return blood > 0 ? say(answered, paid) : answered;
}

/** Why a summon goes home now, or null while it stays. */
function goingHome(round: Round, summon: Fighter): SummonFate | null {
  const caller: Fighter | undefined = summon.summoner
    ? fighterIn(round, summon.summoner)
    : undefined;
  if (!alive(summon)) return 'fell';
  if (!caller || !alive(caller)) return 'sent-home';
  return caller.chakra < (summon.upkeep ?? 0) ? 'sent-home' : null;
}

const HOME_LINES: Readonly<Record<SummonFate, string>> = {
  stayed: '{s} stay{s.s}.',
  fell: '{s} {s.is} beaten and vanish{s.es} in a puff of smoke.',
  'sent-home': '{s} vanish{s.es} in a puff of smoke, back where {s.they} came from.',
};

function leaves(round: Round, summon: Fighter, fate: SummonFate): Round {
  const callerId = summon.summoner ?? '';
  const callId = summon.callId ?? '';
  const fighters = round.fighters
    .filter((f) => f.id !== summon.id)
    .map((f) => {
      if (f.id !== callerId) return f;
      const caller: Fighter = f;
      return {
        ...f,
        summonsOut: (caller.summonsOut ?? []).filter((id) => id !== callId),
        summonFates: { ...caller.summonFates, [callId]: fate },
      };
    });
  return say({ ...round, fighters }, tell(HOME_LINES[fate], { s: summon }));
}

function upkeepPaid(round: Round, summon: Fighter): Round {
  const callerId = summon.summoner;
  const caller = callerId ? fighterIn(round, callerId) : undefined;
  if (!caller || !callerId) return round;
  return {
    ...round,
    fighters: patch(round.fighters, callerId, paying(caller, summon.upkeep ?? 0)),
  };
}

/** At the end of an exchange: each summon out goes home, or its caller pays to keep it. */
export function summonsAfter(round: Round): Round {
  const out = round.fighters.filter((f: Fighter) => f.summoner !== undefined);
  return out.reduce((now, s) => {
    const summon = now.fighters.find((f) => f.id === s.id);
    if (!summon) return now;
    const fate = goingHome(now, summon);
    return fate ? leaves(now, summon, fate) : upkeepPaid(now, summon);
  }, round);
}

/** How each summon the fighter called ended its part, including those still out. */
export function summonFatesOf(fighter: PlanFighter): Record<string, SummonFate> {
  const caller: Fighter = fighter;
  const stayed = Object.fromEntries((caller.summonsOut ?? []).map((id) => [id, 'stayed' as const]));
  return { ...caller.summonFates, ...stayed };
}
