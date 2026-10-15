import { err, ok, type Result } from '@/core';
import type { CombatantSetup } from '@/systems/combat';

import { enemyCombatant, PLAYER_COMBATANT_ID } from '../combatants';
import type { GameContext } from '../context';
import { companionCombatant, senseiCombatant } from '../people/companions';
import { defaultStance } from '../people/teamOrders';
import type { GameState } from '../state';
import { contenderOf, type Contender } from './roster';

/**
 * The two sides of a versus bout, one to four fighters each, as the fight sees them: you first
 * on your side, your allies taking every order (there is no bond to earn in a sandbox), and
 * the other side as foes. The same foe may stand several times; a person only once a side.
 */

/** The most fighters a side fields: as many as a mission brings. */
export const VERSUS_SIDE_MAX = 4;

const YOUR_TAG = 'You';
const ALLY_TAG = 'Ally';
const FOE_TAG = 'Opponent';
const ALLY_PREFIX = 'ally:';

export function nameOf(contender: Contender): string {
  if (contender.kind === 'enemy') return contender.def.name;
  return [contender.def.name, contender.def.familyName].filter(Boolean).join(' ');
}

/** "A", "A and B", "A, B and C". */
export function namesOf(contenders: readonly Contender[]): string {
  const names = contenders.map(nameOf);
  const last = names.pop() ?? '';
  return names.length === 0 ? last : `${names.join(', ')} and ${last}`;
}

/** A fighter as written: people with their arsenal (a sensei with their signatures too). */
function setupOf(c: Contender, state: GameState, ctx: GameContext, tag: string): CombatantSetup {
  if (c.kind === 'enemy') return { ...enemyCombatant(c.def, 0, ctx), tag };
  return c.def.sensei
    ? senseiCombatant(c.def, state, ctx, tag)
    : companionCombatant(c.def, state, ctx, tag);
}

function sideProblem(ctx: GameContext, ids: readonly string[], empty: string): string | null {
  if (ids.length === 0) return empty;
  if (ids.length > VERSUS_SIDE_MAX) return `A side fields at most ${VERSUS_SIDE_MAX} fighters.`;
  const people = ids.filter((id) => contenderOf(ctx, id)?.kind === 'person');
  const twice = people.find((id, i) => people.indexOf(id) !== i);
  if (twice) {
    const contender = contenderOf(ctx, twice);
    return `${contender ? nameOf(contender) : 'They'} can’t stand twice on one side.`;
  }
  return null;
}

const YOUR_SIDE_EMPTY = 'Choose who you will fight as.';
const FOES_EMPTY = 'Choose who you will face.';

/** Why these two sides can't fight, or null when they can (for the picker's button). */
export function versusProblem(
  ctx: GameContext,
  side: readonly string[],
  foes: readonly string[],
): string | null {
  return sideProblem(ctx, side, YOUR_SIDE_EMPTY) ?? sideProblem(ctx, foes, FOES_EMPTY);
}

/** The fighters behind a side's roster ids, or why the side won't do. */
export function sideOf(
  ctx: GameContext,
  ids: readonly string[],
  empty: string,
): Result<Contender[]> {
  const problem = sideProblem(ctx, ids, empty);
  if (problem) return err(problem);
  const found = ids.flatMap((id) => contenderOf(ctx, id) ?? []);
  return found.length === ids.length
    ? ok(found)
    : err('One of those fighters isn’t in this world.');
}

/** You, as the fight's player. */
export function playerSetup(you: Contender, state: GameState, ctx: GameContext): CombatantSetup {
  return { ...setupOf(you, state, ctx, YOUR_TAG), id: PLAYER_COMBATANT_ID };
}

/** Your allies: each under your orders, a person in the stance their specialty suggests. */
export function allySetups(
  allies: readonly Contender[],
  state: GameState,
  ctx: GameContext,
): CombatantSetup[] {
  return allies.map((c, i) => ({
    ...setupOf(c, state, ctx, ALLY_TAG),
    id: `${ALLY_PREFIX}${i + 1}`,
    orders: {},
    ...(c.kind === 'person' ? { stance: defaultStance(c.def, PLAYER_COMBATANT_ID) } : {}),
  }));
}

/** The other side; a foe that stands more than once is numbered, as on a mission. */
export function foeSetups(
  foes: readonly Contender[],
  state: GameState,
  ctx: GameContext,
): CombatantSetup[] {
  return foes.map((c, i) => {
    if (c.kind === 'person') return setupOf(c, state, ctx, FOE_TAG);
    const before = foes.slice(0, i).filter((o) => o.kind === 'enemy' && o.def.id === c.def.id);
    return { ...enemyCombatant(c.def, before.length, ctx), tag: FOE_TAG };
  });
}
