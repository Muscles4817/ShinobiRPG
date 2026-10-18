import { diffStats, type StatDelta } from '@/systems/stats';

import { growCharacter, logDiscoveries, noTalentReason } from '../growth';
import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import {
  adjust,
  busyReason,
  chip,
  firstBlocker,
  log,
  placeHere,
  spendTime,
  statChips,
} from '../ops';
import { personStats } from '../people/progress';
import { sessionGains } from '../people/regimen';
import { teachingFactor } from '../people/teachingFactor';
import { hardWorkEnergy } from '../profile';
import { meetingOn, meetingOpen, meetingsPerWeek, mentorOf, type Meeting } from '../sensei/plan';
import {
  FORMAT_LABELS,
  formatStat,
  SESSION_KEPT_REGARD,
  sessionKept,
  sessionText,
  SHORT_SESSION_ENERGY,
  sessionShare,
  SHORT_SESSION_SLOTS,
} from '../sensei/sessions';
import { withAttendance } from '../sensei/state';
import type { GameState } from '../state';
import type { GameContext } from '../context';
import type { ActionHandler, ActionOf } from './types';

/**
 * A short session your sensei planned for today (`game/sensei/plan.ts`): the format they set,
 * at a share of a lesson's growth, and regard for turning up.
 */

type SenseiSession = ActionOf<'senseiSession'>;

function sessionNow(state: GameState, ctx: GameContext) {
  const sensei = mentorOf(state, ctx);
  const meeting = sensei ? meetingOn(state, sensei, state.time.day) : null;
  return sensei && meeting?.kind === 'session' ? { sensei, meeting } : null;
}

function meetingBlocker(state: GameState, ctx: GameContext, meeting: Meeting): string | null {
  if (sessionKept(state, meeting)) return 'You’ve had today’s session.';
  if (!meetingOpen(state, meeting)) return `Your sensei comes for you from ${meeting.from}.`;
  const place = placeHere(state, ctx, 'training');
  const home = state.locationId === ctx.content.startLocationId;
  return place && home ? null : 'Your sensei meets you at the training ground at home.';
}

function scaled(gains: StatDelta, share: number): StatDelta {
  return Object.fromEntries(Object.entries(gains).map(([id, v]) => [id, v * share]));
}

export const senseiSession: ActionHandler<SenseiSession> = {
  check(state, _action, ctx) {
    const now = sessionNow(state, ctx);
    if (!now) return 'Your sensei hasn’t set a session for today.';
    const energy = hardWorkEnergy(state.character, ctx, SHORT_SESSION_ENERGY);
    return firstBlocker(
      busyReason(state),
      weakFromHunger(state),
      laidUp(state, ctx),
      meetingBlocker(state, ctx, now.meeting),
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
    );
  },
  perform(state, _action, ctx) {
    const now = sessionNow(state, ctx);
    if (now?.meeting.kind !== 'session') return state;
    const { sensei, meeting } = now;
    const stat = formatStat(meeting.format, sensei);
    const gains = noTalentReason(state.character, stat, ctx) ? {} : sessionGains(stat);
    const theirs = personStats(sensei, state);
    const teachers = Object.fromEntries(
      Object.keys(gains).map((id) => [id, theirs[id as keyof typeof theirs]]),
    );
    const share = sessionShare(meetingsPerWeek(state, sensei) - 1);
    const grown = growCharacter(state.character, scaled(gains, share), ctx, {
      teacher: teachingFactor(sensei),
      teachers,
    });
    const energy = hardWorkEnergy(state.character, ctx, SHORT_SESSION_ENERGY);
    const story = sessionText(state, ctx, sensei, meeting.format);
    const trained: GameState = {
      ...state,
      told: story.told,
      character: grown.character,
      mentor: withAttendance(
        { ...state.mentor, outcomes: { ...state.mentor.outcomes, [meeting.day]: 'kept' } },
        SESSION_KEPT_REGARD,
      ),
    };
    const next = adjust(spendTime(trained, SHORT_SESSION_SLOTS, ctx), { energy: -energy });
    const logged = log(next, {
      heading: `${FORMAT_LABELS[meeting.format]} with ${sensei.name}`,
      text: story.line,
      tone: 'success',
      chips: [
        ...statChips(diffStats(state.character.stats, grown.character.stats)),
        chip(`${sensei.name}’s regard rises`, 'gain'),
        chip(`−${energy} energy`, 'cost'),
      ],
    });
    return logDiscoveries(logged, grown.discovered, ctx);
  },
};
