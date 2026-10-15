import { createRng, err, ok, type Result } from '@/core';
import type { CombatGround } from '@/systems/combat';
import type { Stats } from '@/systems/stats';

import { enemyStatLine } from '../combatants';
import type { GameContext } from '../context';
import { createNewGame } from '../creation';
import { reviseDraft } from '../creationDraft';
import { startFight } from '../fightStyle';
import type { GameState } from '../state';
import { defaultDraft } from '../views/creation';
import type { Contender } from './roster';
import { allySetups, foeSetups, nameOf, namesOf, playerSetup, sideOf } from './sides';

/**
 * A versus bout: one to four of the pack's fighters a side, for playtesting. It runs in a
 * sandbox game that is never saved: its character mirrors your fighter (so scouting and the
 * fight screen read them), the fight starts at once, and only the fight is ever played.
 */

export interface VersusPick {
  /** Your side by roster id (`versusRoster`): you first, then your allies. */
  readonly side: readonly string[];
  /** The other side by roster id. */
  readonly foes: readonly string[];
  readonly seed: number;
  /** Where they fight; an open arena when absent. */
  readonly ground?: CombatGround;
}

function statsOf(contender: Contender): Stats {
  return contender.kind === 'person' ? contender.def.stats : enemyStatLine(contender.def);
}

/** A sandbox whose character is your fighter, so every read of "you" reads them. */
function sandboxFor(you: Contender, ctx: GameContext, seed: number): GameState {
  const draft = reviseDraft(defaultDraft(ctx), { name: nameOf(you) }, ctx);
  const fresh = createNewGame({ draft, seed }, ctx);
  return { ...fresh, character: { ...fresh.character, stats: statsOf(you) } };
}

/** Sets up a versus bout and starts the fight, or says why the pick won't do. */
export function createVersus(ctx: GameContext, pick: VersusPick): Result<GameState> {
  const side = sideOf(ctx, pick.side, 'Choose who you will fight as.');
  if (!side.ok) return side;
  const foes = sideOf(ctx, pick.foes, 'Choose who you will face.');
  if (!foes.ok) return foes;
  const [you, ...allies] = side.value;
  if (!you) return err('Choose who you will fight as.');
  const sandbox = sandboxFor(you, ctx, pick.seed);
  const player = playerSetup(you, sandbox, ctx);
  const setup = {
    player,
    allies: allySetups(allies, sandbox, ctx),
    enemies: foeSetups(foes.value, sandbox, ctx),
    canFlee: true,
    ...(pick.ground ? { ground: pick.ground } : {}),
  };
  const vitals = { ...sandbox.character.vitals, health: player.health, chakra: player.chakra };
  const match = {
    side: pick.side,
    foes: pick.foes,
    foeName: namesOf(foes.value),
    startHealth: player.health,
    startChakra: player.chakra,
    maxHealth: player.maxHealth,
  };
  return ok({
    ...sandbox,
    character: { ...sandbox.character, vitals },
    combat: startFight(sandbox, ctx, setup, createRng(pick.seed)),
    versus: match,
  });
}
