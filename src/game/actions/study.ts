import type { StudySource, TechniqueDef } from '@/systems/techniques';

import type { GameContext } from '../context';
import { discover, logDiscoveries, noTalentReason } from '../growth';
import { learnBlockerFor, learnBlockerText, studySession, type Studied } from '../learning';
import { adjust, busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import { shelfBlocker, shelfHolding, sourceOf } from '../shelves';
import { hardWorkEnergy } from '../profile';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/** Studying a scroll on the shelves here: the academy's rack or the library's stacks. */

export const STUDY_ENERGY_COST = 15;
export const STUDY_SLOTS = 1;

function masteryLine(name: string, result: Studied): string {
  if (!result.mastered) {
    return 'You unroll the scroll a little further and practise until your hands ache.';
  }
  return result.unstable
    ? `${name} is yours, just. It is beyond your grade and fights your chakra; it will steady as you grow.`
    : `It finally clicks. ${name} is yours.`;
}

/** What stops any scroll study of this technique, wherever the scroll comes from. */
export function studyBlocker(state: GameState, def: TechniqueDef, ctx: GameContext): string | null {
  const blocker = learnBlockerFor(state, def, ctx);
  const energy = hardWorkEnergy(state.character, ctx, STUDY_ENERGY_COST);
  return firstBlocker(
    noTalentReason(state.character, def.discipline, ctx),
    blocker && learnBlockerText(blocker, def),
    state.character.vitals.energy < energy && `Needs ${energy} energy.`,
  );
}

/** One session with a scroll from any source: progress, time, energy and a record line. */
export function studyFrom(
  state: GameState,
  def: TechniqueDef,
  ctx: GameContext,
  source: StudySource,
): GameState {
  const result = studySession(state, def, ctx, source);
  const energy = hardWorkEnergy(state.character, ctx, STUDY_ENERGY_COST);
  const practised = discover(state.character, { [def.discipline]: 1 });
  const studied = { ...state, techniques: result.book, character: practised.character };
  const next = adjust(spendTime(studied, STUDY_SLOTS, ctx), { energy: -energy });
  const logged = log(next, {
    heading: `Study ${def.name}`,
    text: masteryLine(def.name, result),
    tone: result.mastered ? 'success' : 'info',
    chips: [
      chip(result.mastered ? 'Mastered' : `${result.percent}% learned`, 'gain'),
      ...(result.unstable ? [chip('Unstable', 'cost')] : []),
      chip(`−${energy} energy`, 'cost'),
    ],
  });
  return logDiscoveries(logged, practised.discovered, ctx);
}

export const study: ActionHandler<ActionOf<'study'>> = {
  check(state, action, ctx) {
    const def = ctx.content.techniques.get(action.techniqueId);
    const shelf = shelfHolding(state, ctx, action.techniqueId);
    if (!def || !shelf) return 'That scroll isn’t kept here.';
    return firstBlocker(
      busyReason(state),
      shelfBlocker(state, shelf, def),
      studyBlocker(state, def, ctx),
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.techniques.require(action.techniqueId);
    const shelf = shelfHolding(state, ctx, action.techniqueId);
    return studyFrom(state, def, ctx, shelf ? sourceOf(shelf) : 'scroll');
  },
};
