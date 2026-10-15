import { diffStats } from '@/systems/stats';
import { weekOf } from '@/systems/time';

import type { GameContext } from '../context';
import { busyReason, firstBlocker, log, spendTime, statChips } from '../ops';
import { mentorOf, teamDayOf, teamDayOpen, teamKey } from '../sensei/plan';
import { spendTeamDay } from '../sensei/teamDays';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/** Joins the team for the week's team day: a meal, a challenge, tea, a debrief or a camp. */

const TEAM_DAY_SLOTS = 1;

function today(state: GameState, ctx: GameContext) {
  const sensei = mentorOf(state, ctx);
  const teamDay = sensei ? teamDayOf(state, sensei, weekOf(state.time.day)) : null;
  return sensei && teamDay?.day === state.time.day ? { sensei, teamDay } : null;
}

export const teamDay: ActionHandler<ActionOf<'teamDay'>> = {
  check(state, _action, ctx) {
    const now = today(state, ctx);
    if (!now) return 'There’s no team day today.';
    return firstBlocker(
      busyReason(state),
      state.mentor.outcomes[teamKey(now.teamDay.day)] === 'kept' && 'You were there today.',
      !teamDayOpen(state, now.teamDay) && `The team meets from ${now.teamDay.from}.`,
      state.locationId !== ctx.content.startLocationId && 'The team meets at home.',
    );
  },
  perform(state, _action, ctx) {
    const now = today(state, ctx);
    if (!now) return state;
    const { sensei, teamDay: day } = now;
    const spent = spendTeamDay(state, ctx, sensei, day.ritual.kind);
    const kept = {
      ...spent.state,
      mentor: {
        ...spent.state.mentor,
        outcomes: { ...spent.state.mentor.outcomes, [teamKey(day.day)]: 'kept' as const },
      },
    };
    return log(spendTime(kept, TEAM_DAY_SLOTS, ctx), {
      heading: 'Team day',
      text: day.ritual.line,
      tone: 'success',
      chips: [...statChips(diffStats(state.character.stats, kept.character.stats)), ...spent.chips],
    });
  },
};
