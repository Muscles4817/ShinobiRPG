import { err, ok, type Result } from '@/core';

import type {
  CombatChoice,
  CombatEngine,
  CombatOutcome,
  CombatState,
  CombatView,
  CombatantView,
} from '../../contract';
import { conditionStatuses, targetable } from '../../rules/body';
import { itemsLeft } from '../../rules/items';
import { options, parseChoice } from './options';
import { resolveRound } from './round';
import { decode, DUEL_ENGINE_ID, encode, initialDuel, playerOf, type Fighter } from './state';

function statuses(f: Fighter): string[] {
  if (f.health <= 0) return ['Down'];
  const list = conditionStatuses(f);
  if (f.distant) list.push('Far');
  if (f.stunned > 0) list.push('Dazed');
  if ((f.sealed ?? 0) > 0) list.push('Sealed');
  if (f.guarding) list.push('Guarding');
  return list;
}

function toView(f: Fighter): CombatantView {
  return {
    id: f.id,
    name: f.name,
    ...(f.tag === undefined ? {} : { tag: f.tag }),
    side: f.side,
    health: f.health,
    maxHealth: f.maxHealth,
    chakra: f.chakra,
    maxChakra: f.maxChakra,
    statuses: statuses(f),
    targetable: targetable(f),
  };
}

/**
 * A turn-based 1-vs-N skirmish. Speed sets turn order, guarding halves damage,
 * genjutsu is resisted by willpower, and chakra slowly regenerates each round. Foes who stand
 * back (archers) must be closed on before blows reach them; hidden ones must be found first.
 */
export function createDuelEngine(): CombatEngine {
  return {
    id: DUEL_ENGINE_ID,
    label: 'Classic',
    summary: 'Pick one move a round: strike, guard, a technique, a tool or flee.',

    start: (setup) => encode(initialDuel(setup)),

    act(state: CombatState, choice: CombatChoice, rng): Result<CombatState> {
      const duel = decode(state);
      if (duel.result) return err('The fight is already over.');
      const action = parseChoice(duel, choice);
      if (!action.ok) return action;
      const move = {
        action: action.value,
        ...(choice.targetId === undefined ? {} : { targetId: choice.targetId }),
      };
      return ok(encode(resolveRound(duel, move, rng)));
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
        items: itemsLeft(player),
      };
    },
  };
}
