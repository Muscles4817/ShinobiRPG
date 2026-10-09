import { clamp, err, ok, type Result, type Rng } from '@/core';

import type {
  CombatChoice,
  CombatEngine,
  CombatOption,
  CombatOutcome,
  CombatState,
  CombatView,
} from '../../contract';
import { alive, viewOf } from '../../rules/body';
import { RANGE_LABEL } from '../../rules/range';
import { resolveExchange, trumpDeed } from './round';
import { execution, TACTICS } from './tactics';
import {
  decode,
  encode,
  initialFighters,
  PLAN_ENGINE_ID,
  playerOf,
  type PlanFighter,
  type PlanState,
  type TacticId,
} from './state';

/**
 * Plan & Watch: choose a tactic before the fight, then watch it play out exchange by
 * exchange. One trump card lets you go all out once.
 */

const START_RANGE = 'mid';
/** "Play it out" stops after this many exchanges so a stalemate can't loop forever. */
const AUTO_LIMIT = 30;
const TACTIC_PREFIX = 'tactic:';

function statuses(f: PlanFighter): string[] {
  return [
    ...(f.stunned > 0 ? ['Dazed'] : []),
    ...(f.sealed > 0 ? ['Sealed'] : []),
    ...(f.guarding ? ['Guarding'] : []),
  ];
}

function planOptions(): CombatOption[] {
  return TACTICS.map((t) => ({
    id: `${TACTIC_PREFIX}${t.id}`,
    label: t.label,
    detail: `${t.summary} ${RANGE_LABEL[t.range]} range.`,
    kind: 'plan',
  }));
}

function trumpOption(state: PlanState): CombatOption {
  const deed = trumpDeed(playerOf(state), state.range);
  const what = deed.kind === 'technique' ? deed.technique.name : 'an all-out blow';
  return {
    id: 'trump',
    label: 'Trump card',
    detail: `Go all out with ${what}`,
    kind: 'basic',
    ...(state.trumpUsed ? { disabledReason: 'Already played this fight' } : {}),
  };
}

function options(state: PlanState): CombatOption[] {
  if (state.result) return [];
  if (state.phase === 'plan') return planOptions();
  const flee: CombatOption = { id: 'flee', label: 'Flee', detail: 'Try to escape', kind: 'escape' };
  return [
    { id: 'next', label: 'Next exchange', detail: '', kind: 'continue' },
    { id: 'auto', label: 'Play it out', detail: '', kind: 'continue' },
    trumpOption(state),
    state.canFlee ? flee : { ...flee, disabledReason: 'You cannot flee this fight' },
  ];
}

function fleeChance(state: PlanState): number {
  const runner = playerOf(state);
  const chasers = state.fighters.filter((f) => f.side === 'enemy' && alive(f));
  const fastest = Math.max(...chasers.map((c) => c.attributes.speed));
  const distance = state.range === 'far' ? 0.2 : state.range === 'mid' ? 0.1 : 0;
  return clamp(0.4 + (runner.attributes.speed - fastest) * 0.05 + distance, 0.1, 0.9);
}

function playOut(state: PlanState, rng: Rng): PlanState {
  let current = state;
  for (let i = 0; i < AUTO_LIMIT && !current.result; i++)
    current = resolveExchange(current, false, rng);
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
  const failed = { ...state, log: [...state.log, 'You try to slip away, but you are cut off!'] };
  return resolveExchange(failed, false, rng);
}

function act(state: PlanState, optionId: string, rng: Rng): Result<PlanState> {
  const option = options(state).find((o) => o.id === optionId);
  if (!option) return err(`Unknown combat option "${optionId}".`);
  if (option.disabledReason) return err(option.disabledReason);
  if (optionId.startsWith(TACTIC_PREFIX)) {
    const tactic = optionId.slice(TACTIC_PREFIX.length) as TacticId;
    const label = TACTICS.find((t) => t.id === tactic)?.label ?? tactic;
    return ok({
      ...state,
      phase: 'fight',
      tactic,
      log: [...state.log, `You settle on a plan: ${label}.`],
    });
  }
  if (optionId === 'auto') return ok(playOut(state, rng));
  if (optionId === 'flee') return ok(flee(state, rng));
  return ok(resolveExchange(state, optionId === 'trump', rng));
}

export function createPlanEngine(): CombatEngine {
  return {
    id: PLAN_ENGINE_ID,
    label: 'Plan & Watch',
    summary: 'Choose a tactic, then watch it play out. One trump card per fight.',

    start(setup) {
      const names = setup.enemies.map((e) => e.name).join(', ');
      const state: PlanState = {
        phase: 'plan',
        tactic: null,
        round: 1,
        fighters: initialFighters(setup),
        range: START_RANGE,
        trumpUsed: false,
        log: [setup.intro ?? `${names} square up. How will you fight?`],
        result: null,
        canFlee: setup.canFlee,
      };
      return encode(state);
    },

    act(state: CombatState, choice: CombatChoice, rng): Result<CombatState> {
      const plan = decode(state);
      if (plan.result) return err('The fight is already over.');
      const next = act(plan, choice.optionId, rng);
      return next.ok ? ok(encode(next.value)) : next;
    },

    view(state): CombatView {
      const plan = decode(state);
      const player = playerOf(plan);
      const reliability = Math.round(execution(player) * 100);
      return {
        round: plan.round,
        combatants: plan.fighters.map((f) => viewOf(f, statuses(f))),
        log: plan.log,
        options: options(plan),
        range: plan.range,
        prompt:
          plan.phase === 'plan'
            ? 'Choose your tactic.'
            : `${RANGE_LABEL[plan.range]} range · you follow your plan ${reliability}% of the time`,
      };
    },

    outcome(state): CombatOutcome | null {
      const plan = decode(state);
      if (!plan.result) return null;
      const player = playerOf(plan);
      return {
        result: plan.result,
        rounds: plan.round,
        player: { health: player.health, chakra: player.chakra },
      };
    },
  };
}
