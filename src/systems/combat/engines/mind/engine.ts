import { err, ok, type Result } from '@/core';

import type {
  CombatChoice,
  CombatEngine,
  CombatOption,
  CombatOutcome,
  CombatState,
  CombatView,
} from '../../contract';
import { alive, hasPerk, targetable, viewOf } from '../../rules/body';
import { itemsLeft } from '../../rules/items';
import { RANGE_LABEL } from '../../rules/range';
import { moveFromOption, playerOptions, UNSEEN } from './moves';
import { nextPlans, resolveRound, type PlayerChoice } from './round';
import { itemMove, itemOptions } from './tools';
import {
  decode,
  encode,
  initialFighters,
  MIND_ENGINE_ID,
  playerOf,
  type MindFighter,
  type MindState,
} from './state';

/**
 * The mind game: every round each side secretly commits to a move. Enemies give away a tell
 * first; reading it right (and the range) is the fight. A foe hidden in an illusion shows no
 * honest tell, and has to be found (Search) or broken out of it (Dispel).
 */

const START_RANGE = 'mid';
const UNREADABLE = '???';
const DOWN = 'They are already down.';
const RECOVER: CombatOption = {
  id: 'recover',
  label: 'Shake it off',
  detail: 'You are dazed and lose this exchange',
  kind: 'continue',
};

function statuses(f: MindFighter): string[] {
  return [
    ...(f.stunned > 0 ? ['Dazed'] : []),
    ...(f.sealed > 0 ? ['Sealed'] : []),
    ...(f.opened ? ['Open'] : []),
  ];
}

function intentOf(state: MindState, f: MindFighter): string | undefined {
  const plan = state.plans[f.id];
  if (!plan) return undefined;
  if (f.hidden && !hasPerk(playerOf(state), 'insight')) return UNREADABLE;
  return plan.certain ? `${plan.tell} (you're sure)` : plan.tell;
}

function options(state: MindState): CombatOption[] {
  if (state.result) return [];
  const player = playerOf(state);
  if (player.stunned > 0) return [RECOVER];
  const foes = state.fighters.filter((f) => f.side === 'enemy' && alive(f));
  const all = playerOptions(player, {
    range: state.range,
    canFlee: state.canFlee,
    hiddenFoes: foes.some((f) => f.hidden),
    visibleFoes: foes.some(targetable),
  });
  // Tools sit just before Flee, which stays last.
  return [...all.slice(0, -1), ...itemOptions(player, foes), ...all.slice(-1)];
}

/** Why the chosen target can't be aimed at: hidden, or (for a tool) already down. */
function targetRefusal(
  state: MindState,
  option: CombatOption,
  targetId: string | undefined,
): string | null {
  const target = state.fighters.find((f) => f.id === targetId);
  if (!option.targeted || !target) return null;
  if (target.side === 'enemy' && target.hidden) return UNSEEN;
  return option.kind === 'item' && !alive(target) ? DOWN : null;
}

function toChoice(state: MindState, choice: CombatChoice): Result<PlayerChoice> {
  const option = options(state).find((o) => o.id === choice.optionId);
  if (!option) return err(`Unknown combat option "${choice.optionId}".`);
  if (option.disabledReason) return err(option.disabledReason);
  if (option.id === 'flee') return ok({ kind: 'flee' });
  if (option.id === 'recover') return ok({ kind: 'recover' });
  const move = itemMove(playerOf(state), option.id) ?? moveFromOption(playerOf(state), option.id);
  if (!move) return err(`Unknown move "${option.id}".`);
  const refused = targetRefusal(state, option, choice.targetId);
  if (refused) return err(refused);
  return ok({
    kind: 'move',
    move,
    ...(choice.targetId === undefined ? {} : { targetId: choice.targetId }),
  });
}

export function createMindEngine(): CombatEngine {
  return {
    id: MIND_ENGINE_ID,
    label: 'Mind Game',
    summary: 'Read their tell, then strike, feint, guard, counter or cast. Range matters.',

    start(setup, rng) {
      const fighters = initialFighters(setup);
      const names = setup.enemies.map((e) => e.name).join(', ');
      const state: MindState = {
        round: 1,
        fighters,
        range: START_RANGE,
        plans: nextPlans(fighters, START_RANGE, rng),
        log: [setup.intro ?? `${names} square up. Watch their hands.`],
        result: null,
        canFlee: setup.canFlee,
      };
      return encode(state);
    },

    act(state: CombatState, choice: CombatChoice, rng): Result<CombatState> {
      const mind = decode(state);
      if (mind.result) return err('The fight is already over.');
      const parsed = toChoice(mind, choice);
      if (!parsed.ok) return parsed;
      return ok(encode(resolveRound(mind, parsed.value, rng)));
    },

    view(state): CombatView {
      const mind = decode(state);
      return {
        round: mind.round,
        combatants: mind.fighters.map((f) => viewOf(f, statuses(f), intentOf(mind, f))),
        log: mind.log,
        options: options(mind),
        range: mind.range,
        prompt: `${RANGE_LABEL[mind.range]} range. Read their tell, then choose.`,
      };
    },

    outcome(state): CombatOutcome | null {
      const mind = decode(state);
      if (!mind.result) return null;
      const player = playerOf(mind);
      return {
        result: mind.result,
        rounds: mind.round,
        player: { health: player.health, chakra: player.chakra },
        items: itemsLeft(player),
      };
    },
  };
}
