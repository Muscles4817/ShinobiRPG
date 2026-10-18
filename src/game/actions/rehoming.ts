import { fillSlots } from '@/core';
import type { CompanionTemperament } from '@/systems/companions';
import { PLAYER_OWNER } from '@/systems/companions';

import { kindOf, playerCompanion } from '../companions/make';
import { busyReason, firstBlocker, log, placeHere } from '../ops';
import type { ActionHandler, ActionOf } from './types';

/**
 * The animal clinic as a home between homes: an animal a job rescued waits there until you take
 * it, and a companion you can't keep is rehomed there (a kennel's back to its kennel, a stray
 * back to the streets, where it may be won back, a wild one back to the wild). One companion at
 * a time, so taking the rescued one means rehoming yours first.
 */

const NOT_HERE = 'Find an animal clinic.';

const REHOMED: Readonly<Record<CompanionTemperament, string>> = {
  bred: 'The vet takes {name} back to the kennels, where it will be placed with someone new.',
  stray:
    '{name} is let go at the clinic door and trots off into the streets. It will remember who fed it.',
  wild: 'The vet sees {name} taken back to the wild. It looks back once, then is gone into the trees.',
};

export const takeRescued: ActionHandler<ActionOf<'takeRescued'>> = {
  check(state, _action, ctx) {
    const waiting = state.companions.waiting;
    const yours = playerCompanion(state);
    return firstBlocker(
      busyReason(state),
      !placeHere(state, ctx, 'vet') && NOT_HERE,
      waiting === null && 'No animal is waiting for you here.',
      yours !== null &&
        `You already have ${yours.name}. Rehome ${yours.name} first, or leave ${waiting?.name ?? 'it'} with the vet.`,
    );
  },
  perform(state) {
    const waiting = state.companions.waiting;
    if (!waiting) return state;
    const owned = { ...state.companions.owned, [PLAYER_OWNER]: waiting };
    const companions = { ...state.companions, owned, waiting: null };
    return log(
      { ...state, companions },
      {
        heading: `${waiting.name} comes home`,
        text: `${waiting.name} comes bundled out of the back room and doesn’t leave your side all the way home.`,
        tone: 'success',
      },
    );
  },
};

export const rehomeCompanion: ActionHandler<ActionOf<'rehomeCompanion'>> = {
  check(state, _action, ctx) {
    return firstBlocker(
      busyReason(state),
      !placeHere(state, ctx, 'vet') && NOT_HERE,
      playerCompanion(state) === null && 'You have no companion.',
    );
  },
  perform(state, _action, ctx) {
    const companion = playerCompanion(state);
    if (!companion) return state;
    const { temperament } = kindOf(companion, ctx);
    const { [PLAYER_OWNER]: _gone, ...owned } = state.companions.owned;
    const strayed = temperament === 'stray' ? companion : state.companions.strayed;
    const companions = { ...state.companions, owned, strayed };
    return log(
      { ...state, companions },
      {
        heading: `${companion.name} is rehomed`,
        text: fillSlots(REHOMED[temperament], { name: companion.name }),
        tone: 'info',
      },
    );
  },
};
