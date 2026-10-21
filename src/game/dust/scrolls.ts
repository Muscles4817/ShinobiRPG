import { STAT_GRADES, statTier } from '@/systems/stats';
import { batchAdded, FIRST_BATCH, scrollMastered, studiedScroll } from '@/systems/dusts';

import type { GameContext } from '../context';
import { atHome } from '../home/home';
import { laidUp } from '../injuries';
import { chip, log } from '../ops';
import { vesselOf } from './dust';
import type { GameState } from '../state';

/**
 * S-rank dust scrolls (`docs/design/retinue-plan.md`, step 4e): the one way to command a kind
 * of dust without being born to it. A job hands one over (`reward.dustScroll`); you read it at
 * home a day at a time, and only with the chakra control to follow it. Mastered, it gives you a
 * first batch of the kind to start from and teaches its techniques (`DustDef.techniqueIds`); a
 * body commands one kind of dust at a time.
 */

/** The chakra control an S-rank scroll asks of its reader. */
export const SCROLL_CONTROL = 'B';

function scrollOf(state: GameState, dustId: string) {
  return state.dustScrolls.find((s) => s.dustId === dustId);
}

/** Why a job's dust scroll is no use to you (you command dust, or hold it already), or null. */
export function scrollKept(state: GameState, dustId: string): string | null {
  if (state.dust) return 'You command dust already.';
  return scrollOf(state, dustId) ? 'You hold that scroll already.' : null;
}

/** Why you can't study this scroll now, or null. */
export function studyScrollBlocker(
  state: GameState,
  ctx: GameContext,
  dustId: string,
): string | null {
  const scroll = scrollOf(state, dustId);
  if (!scroll) return 'You hold no such scroll.';
  if (state.dust) return 'A body commands one kind of dust at a time.';
  if (!atHome(state, ctx)) return 'The scroll is at home.';
  if (scroll.lastDay === state.time.day) return 'You have read as much as you can take in today.';
  const grade = statTier(state.character.stats.chakraControl).grade;
  if (STAT_GRADES.indexOf(grade) < STAT_GRADES.indexOf(SCROLL_CONTROL)) {
    return `An S-rank scroll asks chakra control at grade ${SCROLL_CONTROL} to follow.`;
  }
  return laidUp(state, ctx);
}

/** A day's study of a scroll; the last gives you command of its dust. */
export function studyScroll(state: GameState, ctx: GameContext, dustId: string): GameState {
  const scroll = scrollOf(state, dustId);
  const def = ctx.content.dusts.get(dustId);
  if (!scroll || !def) return state;
  const read = studiedScroll(scroll, state.time.day);
  const dustScrolls = state.dustScrolls.map((s) => (s.dustId === dustId ? read : s));
  if (!scrollMastered(read)) {
    return log(
      { ...state, dustScrolls },
      { text: `You work through more of the ${def.name.toLowerCase()} scroll.`, tone: 'info' },
    );
  }
  const cap = vesselOf(def);
  const dust = { dustId, count: batchAdded(0, cap, FIRST_BATCH) };
  const known = state.techniques.known;
  const taught = (def.techniqueIds ?? []).filter((id) => !known.includes(id));
  const techniques = { ...state.techniques, known: [...known, ...taught] };
  return log(
    { ...state, dustScrolls, dust, techniques },
    {
      heading: def.name,
      text: `The last of the scroll makes sense at once. A handful of ${def.name.toLowerCase()} lifts off your palm and stays there.`,
      tone: 'success',
      chips: [
        chip(`Commands ${def.name}`, 'gain'),
        ...taught.map((id) => chip(`Learned ${ctx.content.techniques.require(id).name}`, 'gain')),
      ],
    },
  );
}
