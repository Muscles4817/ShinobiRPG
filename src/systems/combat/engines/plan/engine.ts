import { clamp, err, ok, type Result, type Rng } from '@/core';

import type {
  CombatChoice,
  CombatEngine,
  CombatOption,
  CombatOutcome,
  CombatState,
  CombatView,
} from '../../contract';
import { alive, hasPerk, viewOf } from '../../rules/body';
import { itemsLeft } from '../../rules/items';
import { RANGE_LABEL } from '../../rules/range';
import { screened } from '../../rules/rows';
import { defaultLoadout, slotLimit } from './cards';
import { intentLine, rollIntents } from './intent';
import { upgradeLegacy, withIntents, withKits, withRows, withSlots } from './legacy';
import { rememberedLoadout } from './memory';
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
import { editPlan, tableOptions } from './table';

/**
 * Plan & Watch, after Punch Club: before each round you slot a few cards for each distance
 * (attacks, techniques, footwork that tries to change the range, defences that react on their
 * own), then watch the round play out. Slot order is priority: each exchange you play the first
 * card that is ready and whose condition holds (see `priority.ts`). Between rounds you see what
 * worked and re-plan.
 */

const START_RANGE = 'mid';
/** Exchanges per round; the cards can be changed between rounds. */
export const ROUND_EXCHANGES = 4;

function read(state: CombatState): PlanState {
  return withRows(withIntents(withSlots(upgradeLegacy(withKits(decode(state))))));
}

/** Conditions, and whether a back-row fighter is still out of reach behind their front row. */
function statuses(f: PlanFighter, fighters: readonly PlanFighter[]): string[] {
  return [
    ...(isDazed(f) ? ['Dazed'] : []),
    ...(f.sealed > 0 ? ['Sealed'] : []),
    ...(alive(f) && screened(f, fighters) ? ['Screened'] : []),
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
      ...tableOptions(player),
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
    log: [...next.log, `— End of round ${next.bout}. Change your cards if you like. —`],
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
  const planned = editPlan(state, optionId);
  if (planned) return ok(planned);
  switch (optionId) {
    case 'begin':
      return ok({ ...state, phase: 'fight', log: [...state.log, `— Round ${state.bout} —`] });
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
      const names = setup.enemies.map((e) => e.name).join(', ');
      const fighters = initialFighters(setup).map((f) => ({
        ...f,
        loadout: (f.isPlayer ? rememberedLoadout(setup.plan, f) : null) ?? defaultLoadout(f),
      }));
      const table = { fighters, range: START_RANGE, exchange: 0 } as const;
      const state: PlanState = {
        phase: 'loadout',
        round: 1,
        bout: 1,
        exchange: 0,
        fighters,
        range: START_RANGE,
        seen: {},
        intents: rollIntents(table, rng),
        log: [setup.intro ?? `${names} square up. How will you fight?`],
        result: null,
        canFlee: setup.canFlee,
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
      return {
        round: plan.round,
        combatants: plan.fighters.map((f) => ({
          ...viewOf(f, statuses(f, plan.fighters), intentLine(plan, f, insight)),
          row: f.row,
        })),
        log: plan.log,
        options: options(plan),
        range: plan.range,
        prompt: prompt(plan),
      };
    },

    outcome(state): CombatOutcome | null {
      const plan = read(state);
      const result = plan.result ?? decide(plan.fighters);
      if (!result) return null;
      const player = playerOf(plan);
      return {
        result,
        rounds: plan.round,
        player: { health: player.health, chakra: player.chakra },
        items: itemsLeft(player),
        plan: player.loadout,
      };
    },
  };
}
