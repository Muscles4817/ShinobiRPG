import type { ContractDef, SummonDef } from '@/content';
import type { CombatantSetup, CombatOutcome } from '@/systems/combat';
import { answers, signed, standingAfter, standingStage, type Contract } from '@/systems/contracts';
import { pantryCount, useUp } from '@/systems/inventory';

import { withCalls } from '../combatants';
import type { GameContext } from '../context';
import { chip, log } from '../ops';
import type { GameState } from '../state';

/**
 * Your summoning contract in play (`docs/design/retinue-plan.md`, step 3): the summons that
 * answer you (your standing with the clan reaches theirs, and you carry any offering they ask)
 * ride into mission fights as calls and the techniques that make them; afterwards the clan
 * judges how its summons fared, and the offerings of those called are given up.
 */

export interface Held {
  readonly contract: Contract;
  readonly def: ContractDef;
}

export function heldContract(state: GameState, ctx: GameContext): Held | null {
  const contract = state.contract;
  const def = contract ? ctx.content.contracts.get(contract.contractId) : undefined;
  return contract && def ? { contract, def } : null;
}

/** Why a summon of your contract won't answer now, or null when it will. */
export function summonBlocker(
  state: GameState,
  ctx: GameContext,
  summon: SummonDef,
): string | null {
  const held = heldContract(state, ctx);
  if (!held || !answers(held.contract, summon.standing))
    return 'The clan doesn’t answer you for this one yet.';
  const offering = summon.price?.offeringId;
  if (offering && pantryCount(state.inventory, offering) < 1) {
    return `${summon.name} asks for ${ctx.content.ingredients.require(offering).name.toLowerCase()}, and you carry none.`;
  }
  return null;
}

/** The summons that answer you now. */
export function answering(state: GameState, ctx: GameContext): SummonDef[] {
  const held = heldContract(state, ctx);
  return held ? held.def.summons.filter((s) => summonBlocker(state, ctx, s) === null) : [];
}

/** You, as you go into a mission fight with your contract: its techniques and its calls. */
export function withSummons(
  player: CombatantSetup,
  state: GameState,
  ctx: GameContext,
): CombatantSetup {
  return withCalls(player, answering(state, ctx), ctx);
}

/** Offerings given up for the summons called this fight. */
function offeringsGiven(state: GameState, held: Held, called: readonly string[]): GameState {
  const ids = held.def.summons
    .filter((s) => called.includes(s.id) && s.price?.offeringId)
    .map((s) => ({ id: s.price?.offeringId ?? '', count: 1 }));
  const used = ids.length > 0 ? useUp(state.inventory, ids) : null;
  return used?.ok ? { ...state, inventory: used.value } : state;
}

/** After a fight: the clan judges how its summons fared, and called offerings are given up. */
export function afterSummons(
  state: GameState,
  outcome: CombatOutcome,
  ctx: GameContext,
): GameState {
  const held = heldContract(state, ctx);
  const fates = outcome.summons ?? {};
  const called = Object.keys(fates);
  if (!held || called.length === 0) return state;
  const contract = standingAfter(held.contract, Object.values(fates));
  const given = offeringsGiven({ ...state, contract }, held, called);
  const rose = standingStage(contract) > standingStage(held.contract);
  if (!rose) return given;
  return log(given, {
    heading: held.def.name,
    text: 'The clan thinks better of you. Bigger summons may answer now.',
    tone: 'success',
    chips: [chip('Standing up', 'gain')],
  });
}

/** Why you can't sign this contract now, or null when you can. */
export function signBlocker(state: GameState, contractId: string): string | null {
  if (state.contract) return 'You already hold a contract; one at a time.';
  return state.brokenContracts.includes(contractId)
    ? 'You broke this contract once; the clan won’t take your name again.'
    : null;
}

/** You sign a contract today: its smallest summons answer you from now. */
export function signContract(state: GameState, ctx: GameContext, contractId: string): GameState {
  const def = ctx.content.contracts.require(contractId);
  const first = def.summons.find((s) => s.standing === 0)?.name ?? 'the smallest of them';
  return log(
    { ...state, contract: signed(contractId, state.time.day) },
    {
      heading: `You sign ${def.name}`,
      text: `Your name goes on the scroll in your own blood. From now on ${first} will answer your call.`,
      tone: 'success',
    },
  );
}
