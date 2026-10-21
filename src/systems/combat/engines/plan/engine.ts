import { clamp, err, ok, type Result, type Rng } from '@/core';

import type {
  CombatChoice,
  CombatEngine,
  CombatOption,
  CombatOutcome,
  CombatState,
  CombatView,
} from '../../contract';
import type { CombatUsage } from '../../teamContract';
import { alive, hasPerk, viewOf } from '../../rules/body';
import { itemsLeft } from '../../rules/items';
import { RANGE_LABEL } from '../../rules/range';
import { screened } from '../../rules/rows';
import { costsOwed } from '../../rules/trumps';
import { empowerCostsOwed, isPinned } from '../../rules/verbs';
import { slotLimit } from './cards';
import { fieldMeter, fieldStatuses } from './field';
import { betweenRounds } from './adapt';
import { intentLine, rollIntents } from './intent';
import { lingeringStatuses } from './lingering';
import { upgradeLegacy, withIntents, withKits, withRows, withSlots } from './legacy';
import { prepStatuses } from './prep';
import { openFight } from './opening';
import { groundNote } from './groundPlay';
import { withinGround } from '../../rules/ground';
import { decide, resolveExchange } from './round';
import { isDazed } from './daze';
import {
  decode,
  encode,
  initialFighters,
  PLAN_ENGINE_ID,
  playerOf,
  type PlanFighter,
  type PlanState,
} from './state';
import { editTeam, teamOptions } from './orders';
import { summonFatesOf } from './summons';
import { metersOf, onStage, poolsLeft } from './swarmView';
import { editPlan, tableOptions } from './table';
import { stanceStatus } from './team';
import { foeMarkFor } from './foeTeam';
import { planOf, plannedFighters } from './planning';
import { squareUpLine } from '../../rules/narration';
import { fightSummary } from './summary';
import { humanHealth } from './sizing';

/**
 * Plan & Watch, after Punch Club: before each round you slot a few cards for each distance
 * (attacks, techniques, footwork that tries to change the range, defences that react on their
 * own), then watch the round play out. Slot order is priority: each exchange you play the first
 * card that is ready and whose condition holds (see `priority.ts`). Between rounds you see what
 * worked and re-plan.
 */

/** Exchanges per round; the cards can be changed between rounds. */
export const ROUND_EXCHANGES = 4;

/** The most rounds one "watch to the end" plays, so a fight no one can win still hands back. */
const WATCHED_ROUNDS_MAX = 20;

/** A fight only watched: play on, a round, or to the end. */
const WATCH_OPTIONS: readonly CombatOption[] = [
  { id: 'next', label: 'Next exchange', detail: '', kind: 'continue' },
  { id: 'round', label: 'Watch the round', detail: '', kind: 'continue' },
  { id: 'finish', label: 'Watch to the end', detail: '', kind: 'continue' },
];

const FIGHT_BEGINS = '— The fight begins —';

function read(state: CombatState): PlanState {
  return withRows(withIntents(withSlots(upgradeLegacy(withKits(decode(state))))));
}

/**
 * Conditions, whether a back-row fighter is still out of reach behind their front row, and
 * whether a field blinds them, and what they have ready (empowered, clones, a trap).
 */
function statuses(state: PlanState, f: PlanFighter): string[] {
  return [
    ...(isDazed(f) ? ['Dazed'] : []),
    ...(f.sealed > 0 ? ['Sealed'] : []),
    ...lingeringStatuses(f),
    ...(alive(f) && screened(f, state.fighters) ? ['Screened'] : []),
    ...fieldStatuses(state, f),
    ...prepStatuses(f),
    ...stanceStatus(f, state.fighters),
    ...(alive(f) && f.id === state.mark ? ['Marked'] : []),
    ...(alive(f) && f.id === state.foeMark ? ['Targeted'] : []),
  ];
}

function fleeBlocker(state: PlanState): { disabledReason?: string } {
  if (!state.canFlee) return { disabledReason: 'You cannot flee this fight' };
  return isPinned(playerOf(state))
    ? { disabledReason: 'You are pinned. Wait for the hold to loosen.' }
    : {};
}

function options(state: PlanState): readonly CombatOption[] {
  if (state.result) return [];
  if (state.watching) return WATCH_OPTIONS;
  const flee: CombatOption = { id: 'flee', label: 'Flee', detail: 'Try to escape', kind: 'escape' };
  const escape = { ...flee, ...fleeBlocker(state) };
  if (state.phase === 'loadout') {
    const player = playerOf(state);
    const begin = state.bout === 1 ? 'Begin the fight' : `Begin round ${state.bout}`;
    return [
      ...tableOptions(
        player,
        state.fighters.some((f) => f.side === 'player' && !f.isPlayer),
      ),
      ...teamOptions(state),
      { id: 'begin', label: begin, detail: '', kind: 'continue' },
      escape,
    ];
  }
  return [
    { id: 'next', label: 'Next exchange', detail: '', kind: 'continue' },
    { id: 'round', label: 'Watch the round', detail: '', kind: 'continue' },
    escape,
  ];
}

/** How each fighter on the player's side but the player ends the fight. */
function alliesAfter(fighters: readonly PlanFighter[]): Record<string, { health: number }> {
  return Object.fromEntries(
    fighters
      .filter((f) => f.side === 'player' && !f.isPlayer)
      .map((f) => [f.id, { health: Math.max(0, humanHealth(f)) }]),
  );
}

/** What each fighter used, for the outcome. */
function usage(fighters: readonly PlanFighter[]): Record<string, CombatUsage> {
  return Object.fromEntries(
    fighters.map((f) => [
      f.id,
      {
        techniqueIds: f.used ?? [],
        chakraSpent: f.chakraSpent ?? 0,
        blows: f.blows ?? 0,
        footwork: f.footwork ?? 0,
      },
    ]),
  );
}

function fleeChance(state: PlanState): number {
  const runner = playerOf(state);
  const chasers = state.fighters.filter((f) => f.side === 'enemy' && alive(f));
  const fastest = Math.max(...chasers.map((c) => c.attributes.speed));
  const distance = state.range === 'far' ? 0.2 : state.range === 'mid' ? 0.1 : 0;
  return clamp(0.4 + (runner.attributes.speed - fastest) * 0.05 + distance, 0.1, 0.9);
}

/** Fights an exchange, then foes announce their next move. */
function exchange(state: PlanState, rng: Rng): PlanState {
  const next = endOfRound(resolveExchange(state, rng));
  return next.result ? next : { ...next, intents: rollIntents(next, rng) };
}

/** When the round is over, back to the card table. */
function endOfRound(next: PlanState): PlanState {
  if (next.result || next.exchange < ROUND_EXCHANGES) return next;
  const watching = next.watching ?? false;
  return {
    ...next,
    phase: watching ? 'fight' : 'loadout',
    bout: next.bout + 1,
    exchange: 0,
    fighters: betweenRounds(next.fighters, next.reads, watching),
    ...foeMarkFor(next.fighters),
    // Between rounds the plan screen says what to do; the story only marks the new round.
    log: watching ? [...next.log, '— The next round begins —'] : next.log,
  };
}

function watchRound(state: PlanState, rng: Rng): PlanState {
  let current = state;
  const bout = state.bout;
  while (current.phase === 'fight' && current.bout === bout && !current.result) {
    current = exchange(current, rng);
  }
  return current;
}

/** A watched fight played to its end, or for as many rounds as one press plays. */
function watchToTheEnd(state: PlanState, rng: Rng): PlanState {
  let current = state;
  while (!current.result && current.bout < state.bout + WATCHED_ROUNDS_MAX) {
    current = watchRound(current, rng);
  }
  return current;
}

function flee(state: PlanState, rng: Rng): PlanState {
  if (rng.chance(fleeChance(state))) {
    return {
      ...state,
      log: [...state.log, 'You vanish in a swirl of leaves and get clean away.'],
      result: 'escaped',
    };
  }
  const failed = {
    ...state,
    phase: 'fight' as const,
    log: [...state.log, 'You try to slip away, but they cut you off.'],
  };
  return exchange(failed, rng);
}

function act(state: PlanState, optionId: string, rng: Rng): Result<PlanState> {
  const option = options(state).find((o) => o.id === optionId);
  if (!option) return err(`Unknown combat option "${optionId}".`);
  if (option.disabledReason) return err(option.disabledReason);
  const planned = editPlan(state, optionId) ?? editTeam(state, optionId);
  if (planned) return ok(planned);
  switch (optionId) {
    case 'begin': {
      // Dividers are story text too: no numbers (the round number shows above the log).
      const divider = state.bout === 1 ? FIGHT_BEGINS : '— The next round begins —';
      return ok({ ...state, phase: 'fight', log: [...state.log, divider] });
    }
    case 'flee':
      return ok(flee(state, rng));
    case 'round':
      return ok(watchRound(state, rng));
    case 'finish':
      return ok(watchToTheEnd(state, rng));
    default:
      return ok(exchange(state, rng));
  }
}

function prompt(state: PlanState): string {
  if (state.phase === 'loadout') {
    const over = state.bout > 1 ? 'The round is over. ' : '';
    const pick = `${over}Round ${state.bout}: pick up to ${slotLimit(playerOf(state))} actions for each distance, higher first, and the defence you keep ready there.`;
    const hidden = state.fighters.some((f) => f.side === 'enemy' && alive(f) && f.hidden);
    const ground = groundNote(state.ground);
    return [pick, hidden ? 'Someone is hidden: Search or Dispel finds them.' : null, ground]
      .filter((part) => part !== null)
      .join(' ');
  }
  const where = `${RANGE_LABEL[state.range]} range, round ${state.bout}, exchange ${state.exchange + 1} of ${ROUND_EXCHANGES}`;
  // A watched fight has no card table to show the ground on.
  const ground = state.watching ? groundNote(state.ground) : null;
  return ground ? `${where}. ${ground}` : where;
}

export function createPlanEngine(): CombatEngine {
  return {
    id: PLAN_ENGINE_ID,
    label: 'Plan & Watch',
    summary:
      'Slot cards for each distance, then watch each round play out. Re-plan between rounds.',

    start(setup, rng) {
      const opened = openFight(initialFighters(setup), setup.opening);
      const { fighters, lines, field } = opened;
      const range = withinGround(setup.ground, opened.range);
      const planned = plannedFighters(fighters, setup.plan);
      const table = {
        fighters: planned,
        ...foeMarkFor(planned),
        range,
        exchange: 0,
        round: 1,
        ...(field ? { field } : {}),
      };
      const firstMover = setup.opening?.firstMover;
      const watching = setup.watch ?? false;
      const intro = setup.intro ?? squareUpLine(setup.enemies);
      const state: PlanState = {
        phase: watching ? 'fight' : 'loadout',
        round: 1,
        bout: 1,
        exchange: 0,
        fighters: planned,
        range,
        seen: {},
        ...foeMarkFor(planned),
        intents: rollIntents(table, rng),
        log: [intro, ...lines, ...(watching ? [FIGHT_BEGINS] : [])],
        ...(setup.ground ? { ground: setup.ground } : {}),
        ...(setup.occasion ? { occasion: setup.occasion } : {}),
        result: null,
        canFlee: setup.canFlee && !watching,
        ...(watching ? { watching: true as const } : {}),
        ...(firstMover === undefined ? {} : { firstMover }),
        ...(field ? { field } : {}),
      };
      return encode(state);
    },

    act(state: CombatState, choice: CombatChoice, rng): Result<CombatState> {
      const plan = read(state);
      if (plan.result) return err('The fight is already over.');
      const next = act(plan, choice.optionId, rng);
      return next.ok ? ok(encode(next.value)) : next;
    },

    view(state): CombatView {
      const plan = read(state);
      const insight = hasPerk(playerOf(plan), 'insight');
      const meters = metersOf(fieldMeter(plan), playerOf(plan));
      return {
        round: plan.bout,
        combatants: plan.fighters.map((f) => ({
          ...viewOf(f, statuses(plan, f), intentLine(plan, f, insight)),
          ...onStage(f),
        })),
        log: plan.log,
        ...(plan.logDropped ? { logOffset: plan.logDropped } : {}),
        options: options(plan),
        range: plan.range,
        prompt: prompt(plan),
        ...(meters.length > 0 ? { meters } : {}),
        ...(plan.watching ? { watched: true as const } : {}),
      };
    },

    outcome(state): CombatOutcome | null {
      const plan = read(state);
      const result = plan.result ?? decide(plan.fighters);
      if (!result) return null;
      const player = playerOf(plan);
      return {
        result,
        rounds: plan.bout,
        player: { health: humanHealth(player), chakra: player.chakra },
        items: itemsLeft(player),
        plan: planOf(player),
        costs: [...costsOwed(player), ...empowerCostsOwed(player)],
        chakraSpent: player.chakraSpent ?? 0,
        used: usage(plan.fighters),
        allies: alliesAfter(plan.fighters),
        summary: fightSummary(plan, result),
        summons: summonFatesOf(player),
        ...poolsLeft(player),
      };
    },
  };
}
