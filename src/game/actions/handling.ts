import type { PlaceDef, VetFields } from '@/content';
import { fillSlots } from '@/core';
import { stageForPair, stageOf } from '@/systems/bonds';
import { hungerOf, laidUp } from '@/systems/companions';
import { diffStats, STAT_INFO } from '@/systems/stats';
import { deduct } from '@/systems/wallet';

import { yourCompanion, withCompanion } from '../companions/care';
import { drilledStats } from '../companions/drill';
import { keeperSlots } from '../companions/keeper';
import type { GameContext } from '../context';
import {
  busyReason,
  chip,
  firstBlocker,
  log,
  placeHere,
  placesHere,
  spendTime,
  statChips,
} from '../ops';
import { bondOf } from '../people/cast';
import type { GameState } from '../state';
import { trainableStats } from './companionTraining';
import type { ActionHandler, ActionOf } from './types';

/**
 * A clinic's handlers (`VetFields.handling`): a kennel master or a clan handler drills your
 * companion better than you can (their quality over your own handling), for a fee and a slot,
 * once you are close enough to them; a clan's handler also teaches the deeper arts its kind can
 * learn, once the bond is there. Handling lore, bought far from home, is read once and kept.
 */

const SESSION_SLOTS = 1;
const TEACH_SLOTS = 2;
/** A taught art costs this many sessions' fees. */
const TEACH_FEE_SESSIONS = 4;

type Clinic = Extract<PlaceDef, { kind: 'vet' }> & {
  readonly handling: NonNullable<VetFields['handling']>;
};

function clinicHere(state: GameState, ctx: GameContext): Clinic | null {
  const vet = placeHere(state, ctx, 'vet');
  return vet?.handling ? { ...vet, handling: vet.handling } : null;
}

/** What a handler's session costs you: nothing to the clan whose kennels it is. */
export function handlingFee(state: GameState, clinic: Clinic, sessions = 1): number {
  return clinic.freeForClanId === state.character.clanId ? 0 : clinic.handling.price * sessions;
}

/** Why the handler here won't work with your companion now, or null. */
function handlerBlocker(state: GameState, ctx: GameContext, fee: number): string | null {
  const clinic = clinicHere(state, ctx);
  if (!clinic) return 'Find a clinic with a handler.';
  const yours = yourCompanion(state, ctx);
  if (!yours) return 'You have no companion.';
  const hunger = hungerOf(yours.companion, state.time.day);
  return firstBlocker(
    busyReason(state),
    stageOf(bondOf(state, clinic.keeperId).points) < clinic.handling.minStage &&
      fillSlots('{vet} works only with the companions of those {pair} with {vet.them}.', {
        ...keeperSlots(state, ctx, clinic.keeperId),
        pair: stageForPair(clinic.handling.minStage),
      }),
    laidUp(yours.companion, state.time.day) && `${yours.companion.name} is laid up.`,
    (hunger === 'hungry' || hunger === 'starving') &&
      `${yours.companion.name} is too hungry. Feed it first.`,
    state.wallet.ryo < fee && `Needs ${fee} ryo.`,
  );
}

export const handlerSession: ActionHandler<ActionOf<'handlerSession'>> = {
  check(state, { stat }, ctx) {
    const clinic = clinicHere(state, ctx);
    const yours = yourCompanion(state, ctx);
    return firstBlocker(
      handlerBlocker(state, ctx, clinic ? handlingFee(state, clinic) : 0),
      yours !== null &&
        !trainableStats(yours.companion).includes(stat) &&
        `${yours.companion.name} can’t be drilled in that.`,
    );
  },
  perform(state, { stat }, ctx) {
    const clinic = clinicHere(state, ctx);
    const yours = yourCompanion(state, ctx);
    if (!clinic || !yours) return state;
    const fee = handlingFee(state, clinic);
    const quality = clinic.handling.quality;
    const stats = drilledStats(yours.companion, yours.kind, state.board.seed, { stat, quality });
    const worked = withCompanion(
      { ...state, wallet: deduct(state.wallet, fee) },
      { ...yours.companion, stats },
    );
    const slots = {
      ...keeperSlots(state, ctx, clinic.keeperId),
      pet: yours.companion.name,
      skill: STAT_INFO[stat].label.toLowerCase(),
    };
    return log(spendTime(worked, SESSION_SLOTS, ctx), {
      heading: fillSlots('{vet} works with {pet}', slots),
      text: fillSlots(
        "{vet} drills {pet} in {skill}, sharper than you could, and shows you what {vet.they}{vet.'s} doing as {vet.they} go{vet.es}.",
        slots,
      ),
      tone: 'success',
      chips: [
        ...statChips(diffStats(yours.companion.stats, stats)),
        ...(fee > 0 ? [chip(`−${fee} ryo`, 'cost')] : []),
      ],
    });
  },
};

/** The kind technique this clinic's handler would teach your companion, if any is taught here. */
function teachable(state: GameState, ctx: GameContext, techniqueId: string) {
  const clinic = clinicHere(state, ctx);
  const yours = yourCompanion(state, ctx);
  const technique = yours?.kind.techniques?.find((t) => t.techniqueId === techniqueId && t.handler);
  if (!clinic || !yours || !technique || !(clinic.handling.teaches ?? []).includes(techniqueId))
    return null;
  return { clinic, yours, technique };
}

export const handlerTeach: ActionHandler<ActionOf<'handlerTeach'>> = {
  check(state, { techniqueId }, ctx) {
    const found = teachable(state, ctx, techniqueId);
    if (!found) return 'Nobody here teaches that.';
    const { clinic, yours, technique } = found;
    return firstBlocker(
      handlerBlocker(state, ctx, handlingFee(state, clinic, TEACH_FEE_SESSIONS)),
      yours.companion.learned.includes(techniqueId) && `${yours.companion.name} knows it already.`,
      stageOf(yours.companion.bond) < technique.stage &&
        `${yours.companion.name} isn’t ready. You need to be ${stageForPair(technique.stage)} first.`,
    );
  },
  perform(state, { techniqueId }, ctx) {
    const found = teachable(state, ctx, techniqueId);
    if (!found) return state;
    const { clinic, yours } = found;
    const fee = handlingFee(state, clinic, TEACH_FEE_SESSIONS);
    const learned = { ...yours.companion, learned: [...yours.companion.learned, techniqueId] };
    const taught = withCompanion({ ...state, wallet: deduct(state.wallet, fee) }, learned);
    const name = ctx.content.techniques.require(techniqueId).name;
    return log(spendTime(taught, TEACH_SLOTS, ctx), {
      heading: `${yours.companion.name} learns ${name}`,
      text: `It takes the afternoon and a great deal of patience, but by the end ${yours.companion.name} has it.`,
      tone: 'success',
      chips: [chip(name, 'gain'), ...(fee > 0 ? [chip(`−${fee} ryo`, 'cost')] : [])],
    });
  },
};

function loreHere(state: GameState, ctx: GameContext, loreId: string) {
  const sold = placesHere(state, ctx, 'gear').some((p) => (p.loreIds ?? []).includes(loreId));
  return sold ? ctx.content.companionLore.get(loreId) : undefined;
}

export const buyLore: ActionHandler<ActionOf<'buyLore'>> = {
  check(state, { loreId }, ctx) {
    const lore = loreHere(state, ctx, loreId);
    if (!lore) return 'Nobody sells that here.';
    return firstBlocker(
      busyReason(state),
      state.companions.lore.includes(loreId) && 'You have read it already.',
      state.wallet.ryo < lore.cost && `Needs ${lore.cost} ryo.`,
    );
  },
  perform(state, { loreId }, ctx) {
    const lore = loreHere(state, ctx, loreId);
    if (!lore) return state;
    const companions = { ...state.companions, lore: [...state.companions.lore, loreId] };
    return log(
      { ...state, wallet: deduct(state.wallet, lore.cost), companions },
      {
        heading: lore.name,
        text: `You read ${lore.name} cover to cover. Your own sessions with a companion will count for more.`,
        tone: 'success',
        chips: [chip(`−${lore.cost} ryo`, 'cost')],
      },
    );
  },
};
