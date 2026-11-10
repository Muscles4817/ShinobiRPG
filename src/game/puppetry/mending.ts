import { mendCost, mended, mendShare, type OwnedPuppet } from '@/systems/puppets';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { atHome } from '../home/home';
import { chip, log } from '../ops';
import type { GameState } from '../state';
import { yourPuppets, type YourPuppet } from './yours';

/**
 * Mending a puppet at your bench at home: an afternoon's work and materials (wood, wire,
 * lacquer) for a share of it, more the better your craft, and the work teaches you craft. A
 * broken puppet takes a few sessions; a scratched one, one.
 */

function yoursOf(state: GameState, ctx: GameContext, puppetId: string): YourPuppet | undefined {
  return yourPuppets(state, ctx).find((p) => p.owned.id === puppetId);
}

/** What a session on this puppet costs in materials now. */
export function mendingCost(state: GameState, puppet: YourPuppet): number {
  return mendCost(puppet.owned, puppet.def.healthScale, state.puppetry.craft);
}

/** Why you can't mend this puppet now, or null. Energy and the slot are the action's. */
export function mendBlocker(state: GameState, ctx: GameContext, puppetId: string): string | null {
  const puppet = yoursOf(state, ctx, puppetId);
  if (!puppet) return 'That isn’t one of your puppets.';
  if (puppet.owned.condition >= 1) return 'It is whole; there is nothing to mend.';
  if (!atHome(state, ctx)) return 'You mend it at your bench at home.';
  const ryo = mendingCost(state, puppet);
  return state.wallet.ryo < ryo ? `The materials cost ${ryo} ryo.` : null;
}

function mendLine(before: OwnedPuppet, after: OwnedPuppet): string {
  if (after.condition >= 1) return `${after.name} is whole again, every joint oiled.`;
  return before.condition <= 0
    ? `You fit ${after.name} back together joint by joint. It will take more work yet.`
    : `You plane and lacquer what was broken on ${after.name}.`;
}

/** A session at the bench on one of your puppets. */
export function mendPuppet(state: GameState, ctx: GameContext, puppetId: string): GameState {
  const puppet = yoursOf(state, ctx, puppetId);
  if (!puppet) return state;
  const ryo = mendingCost(state, puppet);
  const paid = spend(state.wallet, ryo);
  if (!paid.ok) return state;
  const puppetry = mended(state.puppetry, puppetId);
  const after = puppetry.puppets.find((p) => p.id === puppetId) ?? puppet.owned;
  const share = Math.round(
    Math.min(1 - puppet.owned.condition, mendShare(state.puppetry.craft)) * 100,
  );
  return log(
    { ...state, wallet: paid.value, puppetry },
    {
      heading: `Mending ${puppet.owned.name}`,
      text: mendLine(puppet.owned, after),
      tone: 'success',
      chips: [chip(`−${ryo} ryo`, 'cost'), chip(`+${share}% mended`, 'gain')],
    },
  );
}
