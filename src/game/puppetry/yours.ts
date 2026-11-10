import type { PuppetDef } from '@/content';
import type { CombatantSetup, CombatCall } from '@/systems/combat';
import { isBroken, type OwnedPuppet } from '@/systems/puppets';
import { knows } from '@/systems/techniques';

import type { GameContext } from '../context';
import { puppetCall } from '../puppets';
import type { GameState } from '../state';

/**
 * Your puppets as they go into a mission fight (`docs/design/retinue-plan.md`, step 5b): each
 * one you can unseal (you know its technique) and that isn't broken rides in as a call, as whole
 * as it came out of the last fight. The unsealing of a puppet that can't come is left at home,
 * so the plan never offers a scroll with nothing in it.
 */

/** A puppet of yours with its frame. */
export interface YourPuppet {
  readonly owned: OwnedPuppet;
  readonly def: PuppetDef;
}

export function yourPuppets(state: GameState, ctx: GameContext): YourPuppet[] {
  return state.puppetry.puppets.flatMap((owned) => {
    const def = ctx.content.puppets.get(owned.frameId);
    return def ? [{ owned, def }] : [];
  });
}

/** Why a puppet of yours can't come into a fight, or null when it can. */
export function stayingHome(state: GameState, puppet: YourPuppet): string | null {
  if (isBroken(puppet.owned)) return 'Broken: it stays home until it is mended.';
  return knows(state.techniques, puppet.def.techniqueId)
    ? null
    : 'You haven’t learned to unseal it yet.';
}

function hurtCall(puppet: YourPuppet, ctx: GameContext): CombatCall {
  const call = puppetCall(puppet.def, ctx);
  const health = Math.max(1, Math.round(call.body.maxHealth * puppet.owned.condition));
  return { ...call, body: { ...call.body, health } };
}

/** Whether a technique unseals a puppet frame of the pack (yours or not). */
function unsealsAPuppet(techniqueId: string, ctx: GameContext): boolean {
  return ctx.content.puppets.all.some((p) => p.techniqueId === techniqueId);
}

/** You, as you go into a mission fight with your puppets on their scrolls. */
export function withYourPuppets(
  player: CombatantSetup,
  state: GameState,
  ctx: GameContext,
): CombatantSetup {
  const coming = yourPuppets(state, ctx).filter((p) => stayingHome(state, p) === null);
  const unsealings = new Set(coming.map((p) => p.def.techniqueId));
  const techniques = player.techniques.filter(
    (t) => unsealings.has(t.id) || !unsealsAPuppet(t.id, ctx),
  );
  if (coming.length === 0 && techniques.length === player.techniques.length) return player;
  return {
    ...player,
    techniques,
    calls: [...(player.calls ?? []), ...coming.map((p) => hurtCall(p, ctx))],
  };
}
