import { createRng, type Rng } from '@/core';
import {
  createPlanEngine,
  type CombatEngine,
  type CombatSetup,
  type CombatState,
} from '@/systems/combat';
import { bandOf } from '@/systems/combat/engines/plan/distance';
import { decode, type PlanFighter, type PlanState } from '@/systems/combat/engines/plan/state';

import { STALEMATE_EXCHANGES } from './runner';

/**
 * Experience metrics (audit P0.4): not who wins, but what a fight is like to play. Read from the
 * engine's own state between exchanges (the bench may look inside; the game never does): how
 * many times the card table comes up, how often the player's turn plays the card it played
 * last, how many turns they lose (dazed or held, a step that fails), how many play something off
 * their plan, and
 * how many fights end before a second plan or run past ten rounds.
 *
 * A fight may be played by a re-planner (`replanner`): a simple bot that edits the plan at each
 * card table after the first, so the bench can say whether adapting between rounds helps.
 */

export interface Experience {
  readonly won: boolean;
  readonly planScreens: number;
  readonly rounds: number;
  /** Exchanges the player was standing at the start of. */
  readonly exchanges: number;
  /** Turns the player took. */
  readonly turns: number;
  /** Turns that played the card the turn before played. */
  readonly repeats: number;
  /** Exchanges they stood in and got nothing from: no turn (dazed, held), or a step that failed. */
  readonly lost: number;
  /** Turns that played something they never slotted (a blow improvised, a look round). */
  readonly offPlan: number;
}

/** A bot's edits at a card table: option ids to pick, in order, before beginning the round. */
export type Replanner = (state: PlanState, options: readonly string[]) => readonly string[];

const RAISE = 'raise:';
const READY = 'ready:';
/** The bot changes up its lead attack once it has played it this many turns running. */
export const REPLAN_CHANGE_UP = 3;
/** Under this share of health, the bot readies a Dodge where it stands. */
export const REPLAN_DODGE_SHARE = 0.5;

function playerIn(state: PlanState): PlanFighter {
  const found = state.fighters.find((f) => f.isPlayer);
  if (!found) throw new Error('No player in the fight');
  return found;
}

/**
 * The re-planning bot: if it leaned on one card three turns running, it raises the next card
 * slotted where it stands above it; if it is under half health, it readies a Dodge there.
 */
export const replanner: Replanner = (state, options) => {
  const me = playerIn(state);
  const band = bandOf(state, me);
  const picks: string[] = [];
  const streak = me.streak;
  if (streak && streak.turns >= REPLAN_CHANGE_UP) {
    const raise = options.find(
      (o) => o.startsWith(`${RAISE}${band}:`) && !o.endsWith(`:${streak.card}`),
    );
    if (raise) picks.push(raise);
  }
  const dodge = `${READY}${band}:dodge`;
  if (me.health < me.maxHealth * REPLAN_DODGE_SHARE && options.includes(dodge)) picks.push(dodge);
  return picks;
};

interface Tally {
  readonly exchanges: number;
  readonly turns: number;
  readonly repeats: number;
  readonly lost: number;
  readonly offPlan: number;
}

const NOTHING: Tally = { exchanges: 0, turns: 0, repeats: 0, lost: 0, offPlan: 0 };

function added(a: Tally, b: Tally): Tally {
  return {
    exchanges: a.exchanges + b.exchanges,
    turns: a.turns + b.turns,
    repeats: a.repeats + b.repeats,
    lost: a.lost + b.lost,
    offPlan: a.offPlan + b.offPlan,
  };
}

/** What one exchange was for the player, from the state before and after it. */
function exchangeTally(before: PlanState, after: PlanState): Tally {
  const was = playerIn(before);
  if (was.health <= 0) return NOTHING;
  const now = playerIn(after);
  const streak = now.streak;
  // Every turn moves the streak: a new card, or one more turn of the same.
  const took =
    streak !== undefined && (streak.card !== was.streak?.card || streak.turns !== was.streak.turns);
  if (!took) return { ...NOTHING, exchanges: 1, lost: 1 };
  const fresh = after.log.slice(before.log.length);
  const offPlan = fresh.some((l) => l.includes('⟦op:') && l.includes(`⟦by:${now.id}⟧`));
  const failedStep = streak.card.startsWith('step-') && bandOf(before, was) === bandOf(after, now);
  return {
    exchanges: 1,
    turns: 1,
    repeats: streak.turns > 1 ? 1 : 0,
    lost: failedStep ? 1 : 0,
    offPlan: offPlan ? 1 : 0,
  };
}

function act(engine: CombatEngine, state: CombatState, optionId: string, rng: Rng): CombatState {
  const next = engine.act(state, { optionId }, rng);
  if (!next.ok) throw new Error(`Bench option ${optionId} refused: ${next.error}`);
  return next.value;
}

/** The bot's edits at a card table after the first, then the round begins. */
function atTable(engine: CombatEngine, state: CombatState, at: TableTurn): CombatState {
  const options = engine.view(state).options.map((o) => o.id);
  const edits = at.replan && at.screens > 0 ? at.replan(decode(state), options) : [];
  const edited = edits.reduce((s, id) => act(engine, s, id, at.rng), state);
  return act(engine, edited, 'begin', at.rng);
}

interface TableTurn {
  readonly replan: Replanner | undefined;
  readonly screens: number;
  readonly rng: Rng;
}

/** One fight of a setup, measured. */
export function experienceOnce(setup: CombatSetup, seed: number, replan?: Replanner): Experience {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  let state = engine.start(setup, rng);
  let tally = NOTHING;
  let planScreens = 0;
  while (!engine.outcome(state) && tally.exchanges < STALEMATE_EXCHANGES) {
    if (engine.view(state).options.some((o) => o.id === 'begin')) {
      state = atTable(engine, state, { replan, screens: planScreens, rng });
      planScreens += 1;
      continue;
    }
    const after = act(engine, state, 'next', rng);
    tally = added(tally, exchangeTally(decode(state), decode(after)));
    state = after;
  }
  return {
    won: engine.outcome(state)?.result === 'victory',
    planScreens,
    rounds: decode(state).bout,
    ...tally,
  };
}

export interface ExperienceReport {
  readonly winRate: number;
  readonly planScreens: number;
  readonly repeatShare: number;
  readonly lostShare: number;
  readonly offPlanShare: number;
  /** Fights over before a second plan screen. */
  readonly oneScreenShare: number;
  /** Fights that ran past ten rounds. */
  readonly longShare: number;
}

export const LONG_ROUNDS = 10;

const ratio = (part: number, whole: number) => (whole === 0 ? 0 : part / whole);

/** `seeds` fights of a setup, summarised. */
export function experience(
  setup: CombatSetup,
  seeds: number,
  replan?: Replanner,
): ExperienceReport {
  const runs = Array.from({ length: seeds }, (_, i) => experienceOnce(setup, i + 1, replan));
  const share = (f: (e: Experience) => boolean) => runs.filter(f).length / runs.length;
  const sum = (f: (e: Experience) => number) => runs.reduce((s, e) => s + f(e), 0);
  return {
    winRate: share((e) => e.won),
    planScreens: sum((e) => e.planScreens) / runs.length,
    repeatShare: ratio(
      sum((e) => e.repeats),
      sum((e) => e.turns),
    ),
    lostShare: ratio(
      sum((e) => e.lost),
      sum((e) => e.exchanges),
    ),
    offPlanShare: ratio(
      sum((e) => e.offPlan),
      sum((e) => e.turns),
    ),
    oneScreenShare: share((e) => e.planScreens <= 1),
    longShare: share((e) => e.rounds > LONG_ROUNDS),
  };
}

/** One line for logs. */
export function describeExperience(label: string, r: ExperienceReport): string {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    `${label}: won ${pct(r.winRate)}, ${r.planScreens.toFixed(1)} plan screens, ` +
    `repeats ${pct(r.repeatShare)}, turns lost ${pct(r.lostShare)}, ` +
    `off plan ${pct(r.offPlanShare)}, ` +
    `over in one plan ${pct(r.oneScreenShare)}, past ${LONG_ROUNDS} rounds ${pct(r.longShare)}`
  );
}
