import { err, ok, type Result } from '@/core';

import type {
  CombatEngine,
  CombatOption,
  CombatOutcome,
  CombatState,
  CombatView,
  CombatantView,
} from '../../contract';
import type { DuelAction } from './actions';
import { resolveRound } from './round';
import {
  decode,
  DUEL_ENGINE_ID,
  encode,
  initialDuel,
  playerOf,
  type DuelState,
  type Fighter,
} from './state';

const TECHNIQUE_PREFIX = 'tech:';

function statuses(f: Fighter): string[] {
  const list: string[] = [];
  if (f.health <= 0) list.push('Down');
  if (f.stunned > 0) list.push('Dazed');
  if (f.guarding) list.push('Guarding');
  return list;
}

function toView(f: Fighter): CombatantView {
  return {
    id: f.id,
    name: f.name,
    side: f.isPlayer ? 'player' : 'enemy',
    health: f.health,
    maxHealth: f.maxHealth,
    chakra: f.chakra,
    maxChakra: f.maxChakra,
    statuses: statuses(f),
  };
}

function options(state: DuelState): CombatOption[] {
  if (state.result) return [];
  const player = playerOf(state);
  const techniques: CombatOption[] = player.techniques.map((t) => {
    const base = {
      id: `${TECHNIQUE_PREFIX}${t.id}`,
      label: t.name,
      detail: `${t.discipline} · ${t.effect} · ${t.chakraCost} chakra`,
    };
    return t.chakraCost > player.chakra ? { ...base, disabledReason: 'Not enough chakra' } : base;
  });
  const flee: CombatOption = { id: 'flee', label: 'Flee', detail: 'Try to escape' };
  return [
    { id: 'strike', label: 'Strike', detail: 'A plain taijutsu attack' },
    { id: 'guard', label: 'Guard', detail: 'Halve damage taken, recover chakra' },
    ...techniques,
    state.canFlee ? flee : { ...flee, disabledReason: 'You cannot flee this fight' },
  ];
}

function parseOption(state: DuelState, optionId: string): Result<DuelAction> {
  const option = options(state).find((o) => o.id === optionId);
  if (!option) return err(`Unknown combat option "${optionId}".`);
  if (option.disabledReason) return err(option.disabledReason);

  if (optionId === 'strike' || optionId === 'guard' || optionId === 'flee') {
    return ok({ kind: optionId });
  }
  const techniqueId = optionId.slice(TECHNIQUE_PREFIX.length);
  const technique = playerOf(state).techniques.find((t) => t.id === techniqueId);
  return technique
    ? ok({ kind: 'technique', technique })
    : err(`Unknown technique "${techniqueId}".`);
}

/**
 * A turn-based 1-vs-N skirmish. Speed sets turn order, guarding halves damage,
 * genjutsu is resisted by willpower, and chakra slowly regenerates each round.
 */
export function createDuelEngine(): CombatEngine {
  return {
    id: DUEL_ENGINE_ID,

    start: (setup) => encode(initialDuel(setup)),

    act(state: CombatState, optionId, rng): Result<CombatState> {
      const duel = decode(state);
      if (duel.result) return err('The fight is already over.');
      const action = parseOption(duel, optionId);
      if (!action.ok) return action;
      return ok(encode(resolveRound(duel, action.value, rng)));
    },

    view(state): CombatView {
      const duel = decode(state);
      return {
        round: duel.round,
        combatants: duel.fighters.map(toView),
        log: duel.log,
        options: options(duel),
      };
    },

    outcome(state): CombatOutcome | null {
      const duel = decode(state);
      if (!duel.result) return null;
      const player = playerOf(duel);
      return {
        result: duel.result,
        rounds: duel.round,
        player: { health: player.health, chakra: player.chakra },
      };
    },
  };
}
