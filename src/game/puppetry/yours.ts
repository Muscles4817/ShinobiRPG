import type { PuppetDef } from '@/content';
import type { CombatantSetup, CombatCall, CombatTechnique } from '@/systems/combat';
import { isBroken, type OwnedPuppet } from '@/systems/puppets';
import { knows } from '@/systems/techniques';

import type { GameContext } from '../context';
import { puppetCall } from '../puppets';
import type { GameState } from '../state';
import { builtDef, builtUnsealing } from './built';

/**
 * Your puppets as they go into a mission fight (`docs/design/retinue-plan.md`, step 5b): each
 * one you can unseal and that isn't broken or on the bench rides in as a call, as whole as it
 * came out of the last fight. A pack's puppet needs its own unsealing learned; one you built
 * needs only the art (any unsealing learned), and brings its own card. The unsealing of a
 * puppet that can't come is left at home, so the plan never offers an empty scroll.
 */

/** A puppet of yours, written as a pack's puppet would be, with the card that unseals it. */
export interface YourPuppet {
  readonly owned: OwnedPuppet;
  readonly def: PuppetDef;
  readonly unsealing: CombatTechnique;
  /** Built by your hands, not given with an art. */
  readonly built: boolean;
}

function yoursOf(owned: OwnedPuppet, ctx: GameContext): YourPuppet | null {
  if (owned.built) {
    const def = builtDef(owned, owned.built, ctx);
    return { owned, def, unsealing: builtUnsealing(def), built: true };
  }
  const def = ctx.content.puppets.get(owned.id);
  if (!def) return null;
  return { owned, def, unsealing: ctx.content.techniques.require(def.techniqueId), built: false };
}

export function yourPuppets(state: GameState, ctx: GameContext): YourPuppet[] {
  return state.puppetry.puppets.flatMap((owned) => yoursOf(owned, ctx) ?? []);
}

/** Whether you have learned the art: any of the pack's unsealings. */
export function knowsPuppetry(state: GameState, ctx: GameContext): boolean {
  return ctx.content.puppets.all.some((p) => knows(state.techniques, p.techniqueId));
}

/** Why a puppet of yours can't come into a fight, or null when it can. */
export function stayingHome(state: GameState, ctx: GameContext, puppet: YourPuppet): string | null {
  if (state.puppetry.build?.puppetId === puppet.owned.id) return 'On the bench being rebuilt.';
  if (isBroken(puppet.owned)) return 'Broken: it stays home until it is mended.';
  const learned = puppet.built
    ? knowsPuppetry(state, ctx)
    : knows(state.techniques, puppet.def.techniqueId);
  return learned ? null : 'You haven’t learned to unseal it yet.';
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
  const coming = yourPuppets(state, ctx).filter((p) => stayingHome(state, ctx, p) === null);
  const unsealings = new Set(coming.map((p) => p.unsealing.id));
  const kept = player.techniques.filter((t) => unsealings.has(t.id) || !unsealsAPuppet(t.id, ctx));
  const own = coming.filter((p) => p.built).map((p) => p.unsealing);
  const techniques = [...kept, ...own];
  if (coming.length === 0 && kept.length === player.techniques.length) return player;
  return {
    ...player,
    techniques,
    calls: [...(player.calls ?? []), ...coming.map((p) => hurtCall(p, ctx))],
  };
}
