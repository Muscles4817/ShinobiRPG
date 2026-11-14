import { findCard, playable } from '@/systems/combat/engines/plan/cards';
import { bandOf } from '@/systems/combat/engines/plan/distance';
import { asRound } from '@/systems/combat/engines/plan/intent';
import { isOpen } from '@/systems/combat/engines/plan/finishers';
import { FREE_CALLS } from '@/systems/combat/engines/plan/roundCalls';
import { fromSlot } from '@/systems/combat/engines/plan/slots';
import type { CardId, Loadout, PlanFighter, PlanState } from '@/systems/combat/engines/plan/state';
import { killerOf } from '@/systems/combat/engines/plan/survival';
import { alive } from '@/systems/combat/rules/body';
import { isPinned } from '@/systems/combat/rules/verbs';

import { exchange, healthOf, sideOf, steer, type Side } from './model';
import { plan, type MindParams, type Planned } from './mind';

/**
 * Closed-loop fights with any number of planning fighters, each on a policy:
 *  - `exchange`: re-plan before every exchange, play the first card (the perf study's loop);
 *  - `round`: plan at the round's start; during the round keep the next planned card unless the
 *    reactive layer invalidates it (it can't be played; a fact it relied on didn't come true; a
 *    trigger fired, the player's calls generalised to any fighter, each once a fight, plus free
 *    breaks by intellect), then re-plan (`onInvalid: 'replan'`) or fall back to the default plan
 *    for the rest of the round (`'default'`); past the planned sequence, the default plan plays
 *    (a conditional priority list, evaluated live: the cheapest reactive policy there is);
 *  - `blind`: plan at the round's start, play the sequence whatever happens;
 *  - `default`: today's engine AI, no planner.
 * `warm` (round policy): at a round's start, if a plan is kept from last round and no trigger
 * fired, re-score only its tail, last round's top alternatives and the engine's pick
 * (`onlyAlso`), with a full search every `fullEvery` rounds. `skipSame`: no re-plan when the
 * situation key (bands, conditions, health and chakra in tenths, intents) equals the last plan's.
 *
 * Foes decide first (their decision is their telegraph), then the player's side, which sees it.
 * The exchange is resolved on the fight's own seeds, which no planner sees.
 */

export type Policy = 'exchange' | 'round' | 'blind' | 'default';

export interface Controller {
  readonly id: string;
  readonly policy: Policy;
  readonly params?: MindParams;
  readonly expertise?: boolean;
  readonly onInvalid?: 'replan' | 'default' | 'light';
  /**
   * The light decision: past the round plan's sequence (and on an invalidation with `onInvalid:
   * 'light'`), the same planner with a tiny budget picks one card; absent, the default plan plays.
   */
  readonly light?: MindParams;
  readonly warm?: boolean;
  readonly fullEvery?: number;
  readonly skipSame?: boolean;
  /** Re-plan when health after the first step strays this far from the plan's expectation. */
  readonly surprise?: number;
  /** Check every step played without a fresh full plan against one (untimed, `audit.ts`). */
  readonly audit?: Auditor;
}

/** Judges a step played without a fresh plan: did a fresh plan agree, and what did it cost. */
export type Auditor = (
  state: PlanState,
  selfId: string,
  played: { readonly tail: readonly CardId[] },
) => { agreed: boolean; regret: number };

const FIGHT_SEED = 1_000_003;

export const TRIGGERS = ['summoned', 'held', 'hurt', 'killer', 'ally-down', 'revealed'] as const;
export type Trigger = (typeof TRIGGERS)[number];

export interface Tally {
  plans: number;
  lightPlans: number;
  fullPlans: number;
  warmPlans: number;
  skipped: number;
  kept: number;
  defaulted: number;
  invalid: Record<string, number>;
  ms: number;
  exchanges: number;
  /** Planning ms by round index (bout), for per-round cost. */
  msByRound: number[];
  /** Planning ms at a round's start (before its first exchange) and within it, by bout.exchange. */
  msStart: number;
  msMid: Record<string, number>;
  exByRound: number[];
  chose: string[];
  /** Cards actually played, an exchange each (`bout.exchange:card`). */
  played: string[];
  /** Audit of kept (not re-planned) steps: fresh plan agreed, and referee regret. */
  audits: { agreed: boolean; regret: number }[];
}

export interface FightOut {
  readonly result: PlanState['result'];
  readonly exchanges: number;
  readonly rounds: number;
  readonly health: { readonly player: number; readonly enemy: number };
  readonly start: { readonly player: number; readonly enemy: number };
  readonly tallies: Readonly<Record<string, Tally>>;
}

interface Mind {
  readonly c: Controller;
  readonly own: Loadout;
  seq: CardId[];
  relies: (readonly string[])[];
  step: number;
  last: Planned | null;
  key: string;
  fired: Set<string>;
  breaks: number;
  expect: { own: number; them: number } | null;
  roundsSinceFull: number;
  fallback: boolean;
  /** The round (bout) the current plan was made for. */
  planBout: number;
  tally: Tally;
}

const caught = (f: PlanFighter) => f.stunned > 0 || f.sealed > 0 || isPinned(f);

/** Trigger events for one fighter between two states (the player's calls, from any side). */
export function triggersFor(before: PlanState, after: PlanState, selfId: string): Trigger[] {
  const me0 = before.fighters.find((f) => f.id === selfId);
  const me1 = after.fighters.find((f) => f.id === selfId);
  if (!me0 || !me1) return [];
  const side = sideOf(me1);
  const foes = (s: PlanState) => s.fighters.filter((f) => sideOf(f) !== side && alive(f));
  const out: Trigger[] = [];
  const had = new Set(foes(before).map((f) => f.id));
  if (foes(after).some((f) => !had.has(f.id))) out.push('summoned');
  if (caught(me1) && !caught(me0)) out.push('held');
  const low = (f: PlanFighter) => f.health < f.maxHealth / 3;
  if (low(me1) && !low(me0)) out.push('hurt');
  const moment = {
    fighters: after.fighters,
    range: after.range,
    intents: after.intents,
    number: after.round,
  };
  if (side === 'player' && killerOf(me1, moment) !== undefined) out.push('killer');
  const mates = (s: PlanFighter) => sideOf(s) === side && s.id !== selfId && !s.shadowOf;
  const up = new Set(before.fighters.filter((f) => mates(f) && alive(f)).map((f) => f.id));
  if (after.fighters.some((f) => up.has(f.id) && !alive(f))) out.push('ally-down');
  if (after.bout >= 2) {
    const newJutsu = foes(after).some((f) => {
      const was = new Set(before.seen[f.id] ?? []);
      return (after.seen[f.id] ?? []).some((id) => id.startsWith('jutsu:') && !was.has(id));
    });
    if (newJutsu) out.push('revealed');
  }
  return out;
}

/** A coarse key of the situation as one fighter sees it. */
function situationKey(state: PlanState, selfId: string): string {
  const self = state.fighters.find((f) => f.id === selfId)!;
  return JSON.stringify([
    state.fighters.map((f) => [
      f.id,
      Math.round((10 * f.health) / f.maxHealth),
      Math.round((10 * f.chakra) / Math.max(1, f.maxChakra)),
      f.stunned,
      f.sealed,
      f.hidden ? 1 : 0,
      isPinned(f) ? 1 : 0,
      alive(f) ? bandOf(state, f) : '-',
    ]),
    sideOf(self) === 'player' ? state.intents : {},
  ]);
}

/** Facts a step relied on that don't hold now. */
export function missingFacts(
  state: PlanState,
  self: PlanFighter,
  facts: readonly string[],
): string[] {
  const foes = state.fighters.filter((f) => f.side !== self.side && f.health > 0);
  const holds = (f: string) => {
    if (f === 'open') return foes.some(isOpen);
    if (f === 'unseen') return self.hidden;
    if (f.startsWith('at:')) return bandOf(state, self) === f.slice(3);
    return true; // 'boosted' and the like: not checked, a weaker reason
  };
  return facts.filter((f) => !holds(f));
}

export function canPlayNow(state: PlanState, self: PlanFighter, id: CardId): boolean {
  if (sideOf(self) === 'enemy') {
    const card = findCard(self, id);
    return (
      card !== undefined &&
      playable(self, card) &&
      fromSlot(self, asRound(state), { card: id }) !== null
    );
  }
  return fromSlot(self, asRound(state), { card: id }) !== null;
}

function newTally(): Tally {
  return {
    plans: 0,
    lightPlans: 0,
    fullPlans: 0,
    warmPlans: 0,
    skipped: 0,
    kept: 0,
    defaulted: 0,
    invalid: {},
    ms: 0,
    exchanges: 0,
    msByRound: [],
    msStart: 0,
    msMid: {},
    exByRound: [],
    chose: [],
    played: [],
    audits: [],
  };
}

function spent(
  t: Tally,
  state: PlanState,
  p: { readonly ms: number; readonly exchanges: number },
): void {
  t.msByRound[state.bout] = (t.msByRound[state.bout] ?? 0) + p.ms;
  t.exByRound[state.bout] = (t.exByRound[state.bout] ?? 0) + p.exchanges;
  if (state.exchange === 0) t.msStart += p.ms;
  else {
    const k = `${state.bout}.${state.exchange}`;
    t.msMid[k] = (t.msMid[k] ?? 0) + p.ms;
  }
}

function doPlan(m: Mind, state: PlanState, fightSeed: number, warm: boolean): void {
  const params = m.c.params!;
  const also = warm && m.last ? warmSet(m) : undefined;
  const p = plan({
    state,
    selfId: m.c.id,
    params,
    expertise: m.c.expertise ?? true,
    fightSeed,
    ...(also ? { also, onlyAlso: true } : {}),
  });
  m.tally.plans++;
  if (also) m.tally.warmPlans++;
  else m.tally.fullPlans++;
  m.tally.ms += p.ms;
  m.tally.exchanges += p.exchanges;
  spent(m.tally, state, p);
  m.last = p;
  m.seq = [...p.best.sequence];
  m.relies = p.relies.map((r) => [...r]);
  m.step = 0;
  m.key = situationKey(state, m.c.id);
  m.expect = p.expect;
  m.fallback = false;
  m.planBout = state.bout;
}

/** A warm start's candidates: last plan's unplayed tail, and its top alternatives' tails/whole. */
function warmSet(m: Mind): CardId[][] {
  const out: CardId[][] = [];
  const tail = m.seq.slice(m.step);
  if (tail.length > 0) out.push(tail);
  for (const s of m.last!.ranked.slice(0, 4)) {
    out.push([...s.sequence]);
    if (s.sequence.length > 1) out.push(s.sequence.slice(1));
  }
  return out;
}

/** One card by the light decision: the same planner, the light budget, nothing kept. */
function lightPlan(m: Mind, state: PlanState, fightSeed: number): CardId | null {
  const p = plan({
    state,
    selfId: m.c.id,
    params: m.c.light!,
    expertise: m.c.expertise ?? true,
    fightSeed,
  });
  m.tally.lightPlans++;
  m.tally.ms += p.ms;
  m.tally.exchanges += p.exchanges;
  spent(m.tally, state, p);
  audit(m, state, p.best.sequence);
  return p.best.sequence[0] ?? null;
}

/** Audits a step played without a full plan; an empty tail is the default plan. */
function audit(m: Mind, state: PlanState, tail: readonly CardId[]): void {
  if (!m.c.audit) return;
  m.tally.audits.push(m.c.audit(state, m.c.id, { tail }));
}

function invalid(m: Mind, why: string): void {
  m.tally.invalid[why] = (m.tally.invalid[why] ?? 0) + 1;
}

/** The card this mind plays this exchange (null = its default), planning if it must. */
function decide(
  m: Mind,
  state: PlanState,
  prev: PlanState | null,
  fightSeed: number,
): CardId | null {
  const c = m.c;
  if (c.policy === 'default' || !c.params) return null;
  const self = state.fighters.find((f) => f.id === c.id);
  if (!self || !alive(self)) return null;
  // A dazed fighter loses its turn and plans nothing (as `rollIntents` for foes).
  if (self.stunned > 0) return null;
  const fired = prev ? triggersFor(prev, state, c.id).filter((t) => !m.fired.has(t)) : [];
  if (c.policy === 'exchange') {
    if (c.skipSame && m.last && situationKey(state, c.id) === m.key && m.seq.length > m.step) {
      m.tally.skipped++;
      return m.seq[m.step++]!;
    }
    const warm = c.warm === true && m.last !== null && state.exchange !== 0 && fired.length === 0;
    for (const t of fired) m.fired.add(t);
    doPlan(m, state, fightSeed, warm);
    if (warm) audit(m, state, m.seq);
    m.step = 1;
    return m.seq[0] ?? null;
  }
  const roundStart = state.exchange === 0 || m.planBout !== state.bout;
  if (roundStart) {
    for (const t of fired) m.fired.add(t);
    const full =
      !c.warm || !m.last || fired.length > 0 || m.roundsSinceFull + 1 >= (c.fullEvery ?? 99);
    m.roundsSinceFull = full ? 0 : m.roundsSinceFull + 1;
    doPlan(m, state, fightSeed, !full);
    if (!full) audit(m, state, m.seq);
    m.step = 1;
    return m.seq[0] ?? null;
  }
  if (m.fallback) {
    m.tally.defaulted++;
    audit(m, state, []);
    return null;
  }
  if (c.policy === 'blind') {
    const id = m.seq[m.step++];
    return id ?? null;
  }
  // The reactive layer: cheap checks on the next planned card.
  let why: string | null = null;
  const next = m.seq[m.step];
  if (fired.length > 0) {
    // Triggers once a fight each; free breaks by intellect on top (as the player's calls).
    for (const t of fired) m.fired.add(t);
    why = `trigger:${fired[0]}`;
  } else if (c.surprise !== undefined && m.step === 1 && m.expect) {
    const side: Side = sideOf(self);
    const other: Side = side === 'player' ? 'enemy' : 'player';
    const off = Math.max(
      Math.abs(healthOf(state, side) - m.expect.own),
      Math.abs(healthOf(state, other) - m.expect.them),
    );
    if (off > c.surprise && m.breaks < FREE_CALLS[c.params.grade]) {
      m.breaks++;
      why = 'surprise';
    }
  }
  if (!why && next !== undefined) {
    if (!canPlayNow(state, self, next)) why = 'unplayable';
    else if (missingFacts(state, self, m.relies[m.step] ?? []).length > 0) why = 'fact-missing';
  }
  if (!why) {
    if (next === undefined) {
      if (c.light) return lightPlan(m, state, fightSeed);
      m.tally.defaulted++;
      audit(m, state, []);
      return null;
    }
    m.tally.kept++;
    audit(m, state, m.seq.slice(m.step));
    m.step++;
    return next;
  }
  invalid(m, why.startsWith('trigger') ? 'trigger' : why);
  if (c.onInvalid === 'default') {
    m.fallback = true;
    m.tally.defaulted++;
    audit(m, state, []);
    return null;
  }
  if (c.onInvalid === 'light' && c.light) {
    m.step = m.seq.length;
    return lightPlan(m, state, fightSeed);
  }
  if (c.skipSame && m.last && situationKey(state, c.id) === m.key) {
    m.tally.skipped++;
    return null;
  }
  doPlan(m, state, fightSeed, false);
  m.step = 1;
  return m.seq[0] ?? null;
}

export function fight(
  start: PlanState,
  controllers: readonly Controller[],
  o: { readonly seed: number; readonly cap: number },
): FightOut {
  const fightSeed = o.seed;
  const minds = controllers.map((c): Mind => ({
    c,
    own: start.fighters.find((f) => f.id === c.id)!.loadout,
    seq: [],
    relies: [],
    step: 0,
    last: null,
    key: '',
    fired: new Set(),
    breaks: 0,
    expect: null,
    roundsSinceFull: 0,
    fallback: false,
    planBout: -1,
    tally: newTally(),
  }));
  // Foes first: their choice is their telegraph, which the player's side then sees.
  const order = [...minds].sort(
    (a, b) =>
      Number(sideOf(fighterOf(start, b.c.id)) === 'enemy') -
      Number(sideOf(fighterOf(start, a.c.id)) === 'enemy'),
  );
  let state = start;
  let prev: PlanState | null = null;
  let n = 0;
  for (; n < o.cap && !state.result; n++) {
    let next = state;
    for (const m of order) {
      const card = decide(m, next, prev, fightSeed);
      if (card !== null)
        m.tally.chose.push(`${next.bout}.${next.exchange}:${card.replace('jutsu:', '')}`);
      next = steer(next, m.c.id, card, m.own);
    }
    prev = state;
    state = exchange(next, FIGHT_SEED * o.seed + n);
    for (const m of minds) {
      const was = prev.fighters.find((f) => f.id === m.c.id)?.streak;
      const now = state.fighters.find((f) => f.id === m.c.id)?.streak;
      if (now && now !== was)
        m.tally.played.push(`${prev.bout}.${prev.exchange}:${now.card.replace('jutsu:', '')}`);
    }
    for (const m of minds) state = steer(state, m.c.id, null, m.own);
  }
  return {
    result: state.result,
    exchanges: n,
    rounds: state.bout,
    health: { player: healthOf(state, 'player'), enemy: healthOf(state, 'enemy') },
    start: { player: healthOf(start, 'player'), enemy: healthOf(start, 'enemy') },
    tallies: Object.fromEntries(minds.map((m) => [m.c.id, m.tally])),
  };
}

const fighterOf = (s: PlanState, id: string) => s.fighters.find((f) => f.id === id)!;
