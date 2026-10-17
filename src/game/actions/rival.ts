import { placeHere, busyReason, firstBlocker, healthFraction, log, chip } from '../ops';
import { findPerson } from '../people/cast';
import { toneReaction } from '../people/together';
import { hardWorkEnergy } from '../profile';
import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import { ANSWER, DECLINED, repliesFor } from '../rival/lines';
import { clampHeat, heatStage, HEAT_STAGES } from '../rival/state';
import { spar, SPAR_ENERGY } from './spar';
import type { ActionHandler, ActionOf } from './types';

/**
 * Your side of the rivalry: answering them (when you meet, and after a spar), and taking up or
 * turning down a challenge. What you say moves the heat by the moment and by their tastes, the
 * same tastes that decide how any talk lands.
 */

const MIN_HEALTH_TO_SPAR = 0.4;

export const answerRival: ActionHandler<ActionOf<'answerRival'>> = {
  check(state, action) {
    const beat = state.rival?.beat;
    if (!beat) return 'Nobody is waiting for an answer.';
    return repliesFor(beat)[action.choiceIndex] ? null : 'That isn’t one of the answers.';
  },
  perform(state, action, ctx) {
    const rival = state.rival;
    const option = rival?.beat && repliesFor(rival.beat)[action.choiceIndex];
    const person = rival && findPerson(state, ctx, rival.personId);
    if (!rival || !option || !person) return state;
    const delta = option.heat + toneReaction(ctx, person, option.tone);
    const heat = clampHeat(rival.heat + delta);
    const answer = ANSWER[rival.temperament][delta >= 0 ? 'warmer' : 'cooler'];
    const moved = heatStage(heat) - heatStage(rival.heat);
    const stage = HEAT_STAGES[heatStage(heat)] ?? 'Grudging';
    return log(
      { ...state, rival: { ...rival, heat, beat: null } },
      {
        heading: person.name,
        text: answer.replaceAll('{name}', person.name),
        tone: delta >= 0 ? 'success' : 'warning',
        ...(moved !== 0
          ? { chips: [chip(`Rivalry: ${stage.toLowerCase()}`, moved > 0 ? 'gain' : 'cost')] }
          : {}),
      },
    );
  },
};

export const acceptChallenge: ActionHandler<ActionOf<'acceptChallenge'>> = {
  check(state, _action, ctx) {
    const rival = state.rival;
    if (!rival?.challenge) return 'Nobody has challenged you.';
    const energy = hardWorkEnergy(state.character, ctx, SPAR_ENERGY);
    return firstBlocker(
      busyReason(state),
      weakFromHunger(state),
      laidUp(state, ctx),
      !placeHere(state, ctx, 'training') && 'They’re waiting at the training ground.',
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
      healthFraction(state) < MIN_HEALTH_TO_SPAR && 'You are too hurt to spar. Rest first.',
    );
  },
  perform(state, _action, ctx, rng) {
    const rival = state.rival;
    if (!rival) return state;
    const taken = { ...state, rival: { ...rival, challenge: null } };
    return spar.perform(taken, { type: 'spar', personId: rival.personId }, ctx, rng);
  },
};

export const declineChallenge: ActionHandler<ActionOf<'declineChallenge'>> = {
  check(state) {
    return state.rival?.challenge ? null : 'Nobody has challenged you.';
  },
  perform(state, _action, ctx) {
    const rival = state.rival;
    const person = rival && findPerson(state, ctx, rival.personId);
    if (!rival || !person) return state;
    const declined = DECLINED[rival.temperament];
    return log(
      {
        ...state,
        rival: { ...rival, challenge: null, heat: clampHeat(rival.heat + declined.heat) },
      },
      {
        heading: `Turned down ${person.name}`,
        text: declined.line.replaceAll('{name}', person.name),
        tone: 'info',
      },
    );
  },
};
