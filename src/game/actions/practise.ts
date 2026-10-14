import { exerciseBlocker, FALL_HARM, practiseSession } from '../exercises';
import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import { adjust, busyReason, chip, firstBlocker, log, placeHere, spendTime } from '../ops';
import { hardWorkEnergy } from '../profile';
import type { ActionHandler, ActionOf } from './types';

/** A session of a chakra control exercise, at a training place that offers it. */

const PRACTICE_SLOTS = 1;

export const practise: ActionHandler<ActionOf<'practise'>> = {
  check(state, action, ctx) {
    const exercise = ctx.content.exercises.get(action.exerciseId);
    const here = placeHere(state, ctx, 'training');
    if (!exercise || !(here?.exerciseIds ?? []).includes(exercise.id))
      return 'That isn’t practised here.';
    const energy = hardWorkEnergy(state.character, ctx, exercise.energyCost);
    return firstBlocker(
      busyReason(state),
      weakFromHunger(state),
      laidUp(state, ctx),
      exerciseBlocker(state, exercise),
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
    );
  },
  perform(state, action, ctx, rng) {
    const exercise = ctx.content.exercises.require(action.exerciseId);
    const energy = hardWorkEnergy(state.character, ctx, exercise.energyCost);
    const session = practiseSession(state, exercise, rng);
    const tired = adjust(spendTime(session.state, PRACTICE_SLOTS, ctx), {
      energy: -energy,
      ...(session.fell ? { health: -FALL_HARM } : {}),
    });
    return log(tired, {
      heading: session.mastered ? `${exercise.name} mastered` : exercise.name,
      text: session.text,
      tone: session.mastered ? 'success' : session.fell ? 'warning' : 'info',
      chips: [
        ...(session.mastered ? [chip('Chakra control can go further', 'gain')] : []),
        chip(`−${energy} energy`, 'cost'),
        ...(session.fell ? [chip(`−${FALL_HARM} health`, 'harm')] : []),
      ],
    });
  },
};
