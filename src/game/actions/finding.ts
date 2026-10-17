import { stageForPair, stageOf } from '@/systems/bonds';
import {
  lostTrail,
  PUP_START_BOND,
  visitStray,
  WILD_START_BOND,
  wonOver,
} from '@/systems/companions';
import { deduct } from '@/systems/wallet';
import { slotName } from '@/systems/time';

import { withNewCompanion } from '../companions/adopt';
import { playerCompanion } from '../companions/make';
import { trackingChance, wildHere, type WildKind } from '../companions/wild';
import type { GameContext } from '../context';
import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import { adjust, busyReason, chip, firstBlocker, log, placeHere, spendTime } from '../ops';
import { bondOf, findPerson } from '../people/cast';
import { hardWorkEnergy } from '../profile';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/**
 * Finding a companion on purpose: tracking a wild one in the wilds over days until it comes to
 * you, or taking a pup from a kennel (a gift to the vet's friends, sold to anyone else).
 */

const TRACK_SLOTS = 2;
export const TRACK_ENERGY = 15;

function tracked(state: GameState, kind: WildKind, closer: boolean): GameState {
  const day = state.time.day;
  const befriending = closer
    ? visitStray(state.companions.befriending, kind.id, day)
    : lostTrail(state.companions.befriending, kind.id, day);
  if (closer && wonOver(befriending, kind.temperament)) {
    const tamed = withNewCompanion(state, kind, WILD_START_BOND);
    const name = playerCompanion(tamed)?.name ?? kind.name;
    return log(tamed, {
      heading: `${name} comes to you`,
      text: `${kind.wild.comes} You call it ${name}.`,
      tone: 'success',
    });
  }
  const companions = { ...state.companions, befriending };
  return log(
    { ...state, companions },
    { text: closer ? kind.wild.closer : kind.wild.lost, tone: closer ? 'info' : 'warning' },
  );
}

export const trackWild: ActionHandler<ActionOf<'trackWild'>> = {
  check(state, { placeId }, ctx) {
    const kind = wildHere(state, ctx, placeId);
    const energy = hardWorkEnergy(state.character, ctx, TRACK_ENERGY);
    return firstBlocker(
      busyReason(state),
      kind === null && 'Nothing here to track.',
      weakFromHunger(state),
      laidUp(state, ctx),
      slotName(state.time) === 'night' && 'Too dark to follow a trail. Come back by day.',
      state.companions.befriending?.lastVisitDay === state.time.day &&
        'You’ve tracked enough for one day.',
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
    );
  },
  perform(state, { placeId }, ctx, rng) {
    const kind = wildHere(state, ctx, placeId);
    if (!kind) return state;
    const energy = hardWorkEnergy(state.character, ctx, TRACK_ENERGY);
    const closer = rng.chance(trackingChance(state));
    const worked = adjust(spendTime(state, TRACK_SLOTS, ctx), { energy: -energy });
    return tracked(worked, kind, closer);
  },
};

/** What a pup from the kennel here costs you: nothing once you are close enough to the vet. */
export function pupPrice(state: GameState, ctx: GameContext): number | null {
  const vet = placeHere(state, ctx, 'vet');
  if (!vet?.pups) return null;
  return stageOf(bondOf(state, vet.keeperId).points) >= vet.pups.giftStage ? 0 : vet.pups.price;
}

export const takePup: ActionHandler<ActionOf<'takePup'>> = {
  check(state, _action, ctx) {
    const price = pupPrice(state, ctx);
    if (price === null) return 'There are no pups here.';
    return firstBlocker(
      busyReason(state),
      playerCompanion(state) !== null && 'You already have a companion.',
      state.wallet.ryo < price &&
        `Needs ${price} ryo, or to be ${giftStageOf(state, ctx)} with the vet.`,
    );
  },
  perform(state, _action, ctx) {
    const vet = placeHere(state, ctx, 'vet');
    const price = pupPrice(state, ctx);
    if (!vet?.pups || price === null) return state;
    const kind = ctx.content.companionKinds.require(vet.pups.kindId);
    const paid = { ...state, wallet: deduct(state.wallet, price) };
    const joined = withNewCompanion(paid, kind, PUP_START_BOND);
    const name = playerCompanion(joined)?.name ?? kind.name;
    const giver = findPerson(state, ctx, vet.keeperId)?.name ?? 'The vet';
    return log(joined, {
      heading: `${name} comes home`,
      text:
        price === 0
          ? `${giver} lifts a pup out of the pen and puts it in your arms. “For a friend.” You call it ${name}.`
          : `You pick a pup from the litter, and it picks you back. You call it ${name}.`,
      tone: 'success',
      chips: price > 0 ? [chip(`−${price} ryo`, 'cost')] : [],
    });
  },
};

function giftStageOf(state: GameState, ctx: GameContext): string {
  return stageForPair(placeHere(state, ctx, 'vet')?.pups?.giftStage ?? 0);
}
