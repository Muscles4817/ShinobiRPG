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
import { empowerCostsOwed } from '../../rules/verbs';
import { slotLimit } from './cards';
import { defaultLoadout } from './defaults';
import { withoutLoneCombos } from './combo';
import { fieldMeter, fieldStatuses } from './field';
import { substitutionsReady } from './footwork';
import { intentLine, rollIntents } from './intent';
import { upgradeLegacy, withIntents, withKits, withRows, withSlots } from './legacy';
import { rememberedLoadout } from './memory';
import { prepStatuses } from './prep';
import { openFight } from './opening';
import { decide, resolveExchange } from './round';
import {
  decode,
  encode,
  initialFighters,
  isDazed,
  PLAN_ENGINE_ID,
  playerOf,
  type PlanFighter,
  type PlanState,
} from './state';
import { editTeam, teamOptions } from './orders';
import { editPlan, tableOptions } from './table';
import { stanceStatus, withStances } from './team';
import { squareUpLine } from '../../rules/narration';

/**
 * Plan & Watch, after Punch Club: before each round you slot a few cards for each distance
 * (attacks, techniques, footwork that tries to change the range, defences that react on their
 * own), then watch the round play out. Slot order is priority: each exchange you play the first
 * card that is ready and whose condition holds (see `priority.ts`). Between rounds you see what
 * worked and re-plan.
 */

/** Exchanges per round; the cards can be changed between rounds. */
export const ROUND_EXCHANGES = 4;

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
    ...(alive(f) && screened(f, state.fighters) ? ['Screened'] : []),
    ...fieldStatuses(state, f),
    ...prepStatuses(f),
    ...stanceStatus(f, state.fighters),
    ...(alive(f) && f.id === state.mark ? ['Marked'] : []),
  ];
}

function options(state: PlanState): CombatOption[] {
  if (state.result) return [];
  const flee: CombatOption = { id: 'flee', label: 'Flee', detail: 'Try to escape', kind: 'escape' };
  const escape = state.canFlee ? flee : { ...flee, disabledReason: 'You cannot flee this fight' };
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
  return {
    ...next,
    phase: 'loadout',
    bout: next.bout + 1,
    exchange: 0,
    fighters: substitutionsReady(next.fighters),
    log: [...next.log, '— The round is over. Change your cards if you like. —'],
  };
}

function watchRound(state: PlanState, rng: Rng): PlanState {
  let current = state;
  while (current.phase === 'fight' && !current.result) current = exchange(current, rng);
  return current;
}

function flee(state: PlanState, rng: Rng): PlanState {
  if (rng.chance(fleeChance(state))) {
    return {
      ...state,
      log: [...state.log, 'You vanish in a swirl of leaves and escape!'],
      result: 'escaped',
    };
  }
  const failed = {
    ...state,
    phase: 'fight' as const,
    log: [...state.log, 'You try to slip away, but you are cut off!'],
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
      const divider = state.bout === 1 ? '— The fight begins —' : '— The next round begins —';
      return ok({ ...state, phase: 'fight', log: [...state.log, divider] });
    }
    case 'flee':
      return ok(flee(state, rng));
    case 'round':
      return ok(watchRound(state, rng));
    default:
      return ok(exchange(state, rng));
  }
}

function prompt(state: PlanState): string {
  if (state.phase === 'loadout') {
    const pick = `Round ${state.bout}: pick up to ${slotLimit(playerOf(state))} cards for each distance. Higher cards play first.`;
    const hidden = state.fighters.some((f) => f.side === 'enemy' && alive(f) && f.hidden);
    return hidden ? `${pick} Someone is hidden: Search or Dispel finds them.` : pick;
  }
  return `${RANGE_LABEL[state.range]} range, round ${state.bout}, exchange ${state.exchange + 1} of ${ROUND_EXCHANGES}`;
}

export function createPlanEngine(): CombatEngine {
  return {
    id: PLAN_ENGINE_ID,
    label: 'Plan & Watch',
    summary:
      'Slot cards for each distance, then watch each round play out. Re-plan between rounds.',

    start(setup, rng) {
      const names = setup.enemies.map((e) => e.name);
      const { fighters, range, lines, field } = openFight(initialFighters(setup), setup.opening);
      const planned = withStances(
        fighters.map((f) => ({
          ...f,
          loadout:
            (f.isPlayer ? rememberedLoadout(setup.plan, f) : null) ??
            defaultLoadout(withoutLoneCombos(f, fighters), fighters),
        })),
      );
      const table = { fighters: planned, range, exchange: 0, ...(field ? { field } : {}) };
      const firstMover = setup.opening?.firstMover;
      const state: PlanState = {
        phase: 'loadout',
        round: 1,
        bout: 1,
        exchange: 0,
        fighters: planned,
        range,
        seen: {},
        intents: rollIntents(table, rng),
        log: [setup.intro ?? `${squareUpLine(names)} How will you fight?`, ...lines],
        result: null,
        canFlee: setup.canFlee,
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
      const meter = fieldMeter(plan);
      return {
        round: plan.bout,
        combatants: plan.fighters.map((f) => ({
          ...viewOf(f, statuses(plan, f), intentLine(plan, f, insight)),
          row: f.row,
        })),
        log: plan.log,
        options: options(plan),
        range: plan.range,
        prompt: prompt(plan),
        ...(meter ? { meters: [meter] } : {}),
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
        player: { health: player.health, chakra: player.chakra },
        items: itemsLeft(player),
        plan: player.loadout,
        costs: [...costsOwed(player), ...empowerCostsOwed(player)],
        chakraSpent: player.chakraSpent ?? 0,
        used: usage(plan.fighters),
      };
    },
  };
}
