import { alive } from '../../rules/body';
import { readsInTheMoment } from './judgement';
import { harmLine } from '../../rules/narration';
import { tell } from '../../rules/telling';
import type { CombatCall, SummonFate } from '../../contract';
import { answers } from './calls';
import { perchesKept, perchOn, perchUpkeep } from './perching';
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
 * (`summonPlans.ts`), from the next exchange; a puppet's maker steps back behind it. Its caller pays any blood price at once and its upkeep in chakra at the
 * end of every exchange it stays. It goes home when they can't pay, when it falls, or when they
 * do; how it went is kept on the caller for the outcome. A summon hurt badly enough goes before it
 * falls (`BROKEN_SHARE`), and won't answer again this fight; a caller who reads the fight sends one
 * home hurt to save it (`SAVED_SHARE`), and lets one go to spare chakra it can't keep paying for
 * (`UPKEEP_HORIZON`), so a summoner calls and unsummons what the fight needs. Sage toads perch on
 * their caller as they answer (`perching.ts`), and are paid for there.
 */

type Fighter = PlanFighter;

/** A blood price never takes the caller's last breath. */
const BLOOD_FLOOR = 1;
/** Hurt to this share of its health, a summon can't fight on: it goes, lost for the fight. */
export const BROKEN_SHARE = 0.25;
/** Hurt to this share, a caller who reads the fight sends it home before it is lost. */
export const SAVED_SHARE = 0.45;
/** Exchanges of upkeep a caller who reads the fight wants in hand for what they keep out. */
export const UPKEEP_HORIZON = 3;

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
    ...(call.puppet ? { puppet: true as const } : {}),
    ...(call.mount ? { mount: true as const } : {}),
  };
  // Its plan is made as the exchange ends, before its first turn (`summonPlans.ts`).
  return fighter;
}

/** The caller's turn on a summoning technique: the body answers, if they hold the call. */
export function callSummon(round: Round, actor: PlanFighter, callId: string): Round {
  const caller: Fighter = actor;
  const call = caller.calls?.find((c) => c.id === callId);
  if (!call || !answers(caller, callId)) {
    return say(round, tell('{a.their} summoning finds nothing to answer it.', { a: actor }));
  }
  const body = summoned(round, caller, call);
  // A sage toad lands on its caller's shoulder, never on the field (`perching.ts`).
  if (call.perch) return perchOn(round, caller, body);
  const blood = Math.min(call.bloodPrice ?? 0, Math.max(0, caller.health - BLOOD_FLOOR));
  const out = [...(caller.summonsOut ?? []), callId];
  // A puppeteer steps back behind what they unsealed and works it from there.
  const row = call.puppet ? { row: 'back' as const } : {};
  const fighters = round.fighters.map((f) =>
    f.id === caller.id ? { ...f, health: f.health - blood, summonsOut: out, ...row } : f,
  );
  const answered = say(
    { ...round, fighters: [...fighters, body] },
    tell(call.puppet ? PUPPET_CALL : SUMMON_CALL, { a: actor, b: body }),
  );
  const paid = harmLine(tell('{a} pay{a.s} in blood.', { a: actor }), blood);
  return blood > 0 ? say(answered, paid) : answered;
}

const SUMMON_CALL = '{a} slam{a.s} a palm down, and {b} answers the call in a burst of smoke.';
const PUPPET_CALL =
  '{a} snap{a.s} a scroll open, and {b} unfolds out of it, chakra threads running to {b.their} joints.';

/** Why a summon goes, and whether it is lost for the fight. */
interface Going {
  readonly fate: SummonFate;
  readonly lost: boolean;
  /** Its caller sent it home hurt, before it could be lost. */
  readonly saved?: true;
}

function hurtTo(summon: Fighter, share: number): boolean {
  return summon.health <= summon.maxHealth * share;
}

/** Why a summon goes home now, or null while it stays. */
function goingHome(round: Round, summon: Fighter): Going | null {
  const caller: Fighter | undefined = summon.summoner
    ? fighterIn(round, summon.summoner)
    : undefined;
  // A puppet has no home to go to: it fights until it breaks.
  if (!alive(summon) || (!summon.puppet && hurtTo(summon, BROKEN_SHARE))) {
    return { fate: 'fell', lost: true };
  }
  if (!caller || !alive(caller)) return { fate: 'sent-home', lost: false };
  if (!summon.puppet && readsInTheMoment(caller) && hurtTo(summon, SAVED_SHARE)) {
    return { fate: 'sent-home', lost: true, saved: true };
  }
  return caller.chakra < (summon.upkeep ?? 0) ? { fate: 'sent-home', lost: false } : null;
}

const HOME_LINES: Readonly<Record<SummonFate, string>> = {
  stayed: '{s} stay{s.s} to the end.',
  fell: '{s} {s.is} beaten and vanish{s.es} in a puff of smoke.',
  'sent-home': '{s} vanish{s.es} in a puff of smoke, back where {s.they} came from.',
};

/** A puppet has nowhere to go home to: it drops where it stands. */
const PUPPET_LINES: Readonly<Record<SummonFate, string>> = {
  stayed: HOME_LINES.stayed,
  fell: '{s} clatter{s.s} apart, the threads gone slack.',
  'sent-home': '{s} drop{s.s} in a heap as the threads to {s.them} give out.',
};

const SAVED_LINE =
  '{a} release{a.s} {s} before {s.they} {s.is} lost, and {s.they} vanish{s.es} in a puff of smoke.';
const SPARED_LINE = '{a} let{a.s} {s} go home in a puff of smoke, to spare {a.their} chakra.';

function leaves(round: Round, summon: Fighter, going: Going): Round {
  const { fate } = going;
  const callerId = summon.summoner ?? '';
  const callId = summon.callId ?? '';
  const caller = fighterIn(round, callerId);
  const fighters = round.fighters
    .filter((f) => f.id !== summon.id)
    .map((f) => {
      if (f.id !== callerId) return f;
      const caller: Fighter = f;
      const lost = caller.summonsLost ?? [];
      return {
        ...f,
        summonsOut: (caller.summonsOut ?? []).filter((id) => id !== callId),
        summonFates: { ...caller.summonFates, [callId]: fate },
        ...(going.lost && !lost.includes(callId) ? { summonsLost: [...lost, callId] } : {}),
      };
    });
  const lines = summon.puppet ? PUPPET_LINES : HOME_LINES;
  const line =
    going.saved && caller
      ? tell(SAVED_LINE, { a: caller, s: summon })
      : tell(lines[fate], { s: summon });
  return say({ ...round, fighters }, line);
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

/** The fighters a caller's upkeep is reckoned among. */
interface Table {
  readonly fighters: readonly PlanFighter[];
}

/** Summons a caller has on the field now, smallest body first. */
function onField(round: Round, callerId: string): Fighter[] {
  return round.fighters
    .filter((f: Fighter) => f.summoner === callerId && !f.puppet)
    .sort((a, b) => a.maxHealth - b.maxHealth);
}

/** What a caller pays each exchange for everything they keep out, perched toads included. */
export function upkeepOut(round: Table, caller: Fighter): number {
  const fielded = round.fighters
    .filter((f: Fighter) => f.summoner === caller.id)
    .reduce((sum, f: Fighter) => sum + (f.upkeep ?? 0), 0);
  return fielded + perchUpkeep(caller);
}

/**
 * A caller who reads the fight, short of the chakra to keep everything out a few exchanges more,
 * lets the smallest go home (it may come again): spending chakra on what the fight needs.
 */
function spared(round: Round, callerId: string): Round {
  const caller: Fighter | undefined = fighterIn(round, callerId);
  if (!caller || !alive(caller) || !readsInTheMoment(caller)) return round;
  const out = onField(round, callerId);
  const [smallest] = out;
  if (!smallest || out.length < 2) return round;
  if (caller.chakra >= upkeepOut(round, caller) * UPKEEP_HORIZON) return round;
  const gone = leaves(round, smallest, { fate: 'sent-home', lost: false });
  return { ...gone, lines: [...round.lines, tell(SPARED_LINE, { a: caller, s: smallest })] };
}

/** At the end of an exchange: each summon out goes home, or its caller pays to keep it. */
export function summonsAfter(round: Round): Round {
  const out = round.fighters.filter((f: Fighter) => f.summoner !== undefined);
  const kept = out.reduce((now, s) => {
    const summon = now.fighters.find((f) => f.id === s.id);
    if (!summon) return now;
    const going = goingHome(now, summon);
    return going ? leaves(now, summon, going) : upkeepPaid(now, summon);
  }, round);
  const callers = [...new Set(out.map((s: Fighter) => s.summoner ?? ''))];
  return perchesKept(callers.reduce(spared, kept));
}

/** How each summon the fighter called ended its part, including those still out. */
export function summonFatesOf(fighter: PlanFighter): Record<string, SummonFate> {
  const caller: Fighter = fighter;
  const stayed = Object.fromEntries((caller.summonsOut ?? []).map((id) => [id, 'stayed' as const]));
  return { ...caller.summonFates, ...stayed };
}
