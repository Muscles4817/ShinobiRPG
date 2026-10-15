import { createRng, err, ok, type Result } from '@/core';
import type { CombatantSetup } from '@/systems/combat';
import type { Stats } from '@/systems/stats';

import { enemyCombatant, enemyStatLine, PLAYER_COMBATANT_ID } from '../combatants';
import type { GameContext } from '../context';
import { createNewGame } from '../creation';
import { reviseDraft } from '../creationDraft';
import { startFight } from '../fightStyle';
import { companionCombatant, senseiCombatant } from '../people/companions';
import type { GameState } from '../state';
import { defaultDraft } from '../views/creation';
import { contenderOf, type Contender } from './roster';

/**
 * A versus bout: any two fighters from the pack, head to head, for playtesting. It runs in a
 * sandbox game that is never saved: its character mirrors your fighter (so scouting and the
 * fight screen read them), the fight starts at once, and only the fight is ever played.
 */

const YOUR_TAG = 'You';
const FOE_TAG = 'Opponent';

export interface VersusPick {
  /** Roster ids (`versusRoster`): who you play, and who you face. */
  readonly youId: string;
  readonly foeId: string;
  readonly seed: number;
}

function nameOf(contender: Contender): string {
  if (contender.kind === 'enemy') return contender.def.name;
  return [contender.def.name, contender.def.familyName].filter(Boolean).join(' ');
}

function statsOf(contender: Contender): Stats {
  return contender.kind === 'person' ? contender.def.stats : enemyStatLine(contender.def);
}

/** A fighter as written: people with their arsenal (a sensei with their signatures too). */
function setupOf(c: Contender, state: GameState, ctx: GameContext, tag: string): CombatantSetup {
  if (c.kind === 'enemy') return { ...enemyCombatant(c.def, 0, ctx), tag };
  return c.def.sensei
    ? senseiCombatant(c.def, state, ctx, tag)
    : companionCombatant(c.def, state, ctx, tag);
}

/** A sandbox whose character is your fighter, so every read of "you" reads them. */
function sandboxFor(you: Contender, ctx: GameContext, seed: number): GameState {
  const draft = reviseDraft(defaultDraft(ctx), { name: nameOf(you) }, ctx);
  const fresh = createNewGame({ draft, seed }, ctx);
  return { ...fresh, character: { ...fresh.character, stats: statsOf(you) } };
}

/** Sets up a versus bout and starts the fight, or says why the pick won't do. */
export function createVersus(ctx: GameContext, pick: VersusPick): Result<GameState> {
  const you = contenderOf(ctx, pick.youId);
  const foe = contenderOf(ctx, pick.foeId);
  if (!you) return err('Choose who you will fight as.');
  if (!foe) return err('Choose who you will face.');
  const sandbox = sandboxFor(you, ctx, pick.seed);
  const player = { ...setupOf(you, sandbox, ctx, YOUR_TAG), id: PLAYER_COMBATANT_ID };
  const opponent = setupOf(foe, sandbox, ctx, FOE_TAG);
  const setup = { player, allies: [], enemies: [opponent], canFlee: true };
  const vitals = { ...sandbox.character.vitals, health: player.health, chakra: player.chakra };
  const match = {
    youId: pick.youId,
    foeId: pick.foeId,
    foeName: nameOf(foe),
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
