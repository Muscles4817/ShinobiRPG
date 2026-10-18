import type { StudySource, TechniqueDef } from '@/systems/techniques';

import type { GameContext } from '../context';
import { discover, logDiscoveries, noTalentReason } from '../growth';
import { learnBlockerFor, learnBlockerText, studySession, type Studied } from '../learning';
import { adjust, busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import { shelfBlocker, shelfHolding, sourceOf } from '../shelves';
import { hardWorkEnergy } from '../profile';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';
import { STUDY_LINES } from '../everyday/deskLines';
import { tellDaily } from '../everyday/tell';

/** Studying a scroll on the shelves here: the academy's rack or the library's stacks. */

export const STUDY_ENERGY_COST = 15;
export const STUDY_SLOTS = 1;

/** The line for a session that mastered the technique; one that didn't is told from a bank. */
function masteryLine(name: string, result: Studied): string {
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
  const said = result.mastered
    ? null
    : tellDaily(state, ctx, STUDY_LINES, { key: def.id, firstOf: `study:${def.id}` });
  const studied = {
    ...state,
    techniques: result.book,
    character: practised.character,
    told: said?.told ?? state.told,
  };
  const next = adjust(spendTime(studied, STUDY_SLOTS, ctx), { energy: -energy });
  const logged = log(next, {
    heading: `Study ${def.name}`,
    text: said?.text ?? masteryLine(def.name, result),
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
