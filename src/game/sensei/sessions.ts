import type { PersonDef, SenseiFeedback, SenseiSpeech, SessionFormat } from '@/content';
import { fillSlots } from '@/core';
import type { StatId } from '@/systems/stats';

import type { GameContext } from '../context';
import { personSlots } from '../people/pronouns';
import type { GameState } from '../state';
import { tellFresh, type Telling } from '../telling';
import type { Meeting } from './plan';
import { waysOf } from './generate';

/**
 * What a short session with your sensei works on and how it reads. Each format drills one
 * stat (a drill drills their specialty) at a share of a full lesson. A session is short: it
 * takes energy but no time slot (they catch you before the day's work), so it adds to your
 * training rather than replacing a drill. It earns regard, not bond: closeness comes from the
 * lesson, talk and team days, so a sensei who sees you daily doesn't hurry the nomination.
 */

/**
 * A week of short sessions is worth this many full lessons, however many there are: a sensei
 * who sees you daily spreads the same help thinner than one who comes twice.
 */
export const WEEK_OF_SESSIONS = 1;
export const SHORT_SESSION_ENERGY = 10;
export const SHORT_SESSION_SLOTS = 0;
/** Regard for coming when they said. */
export const SESSION_KEPT_REGARD = 3;

export const FORMAT_STAT: Readonly<Record<Exclude<SessionFormat, 'drill'>, StatId>> = {
  spar: 'taijutsu',
  'team-drill': 'speed',
  field: 'perception',
  theory: 'intellect',
  meditation: 'chakraControl',
  march: 'stamina',
  review: 'willpower',
};

export const FORMAT_LABELS: Readonly<Record<SessionFormat, string>> = {
  drill: 'Drills',
  spar: 'Sparring',
  'team-drill': 'Team drills',
  field: 'Fieldcraft',
  theory: 'Theory',
  meditation: 'Meditation',
  march: 'March',
  review: 'Review',
};

/** Sign-offs remembered: none comes back within this many sessions after it. */
export const SIGN_OFF_MEMORY = 4;

/** One short session's growth against a full lesson's, for a week of `shortSessions`. */
export function sessionShare(shortSessions: number): number {
  return WEEK_OF_SESSIONS / Math.max(1, shortSessions);
}

/** The stat a format drills with this sensei. */
export function formatStat(format: SessionFormat, sensei: PersonDef): StatId {
  if (format === 'drill') return sensei.sensei?.specialty ?? sensei.specialty ?? 'taijutsu';
  return FORMAT_STAT[format];
}

/** What they say as a session ends: their manner's lines, and what they always say. */
function signOffs(sensei: PersonDef, speech: SenseiSpeech, feedback: SenseiFeedback) {
  const catchphrase = sensei.sensei?.voice?.catchphrase;
  return [...speech.signOffs[feedback], ...(catchphrase ? [`“${catchphrase}”`] : [])];
}

/**
 * The session's story, in their manner: a late sensei is late, the session goes one of its
 * ways, and they send you off with a line you haven't heard from them lately.
 */
export function sessionText(
  state: GameState,
  ctx: GameContext,
  sensei: PersonDef,
  format: SessionFormat,
): Telling<string> {
  const speech = ctx.content.senseiSpeech;
  const ways = waysOf(sensei);
  const key = `${state.board.seed}|${state.time.day}`;
  const late =
    ways?.cadence.punctuality === 'late'
      ? tellFresh(state.told, { name: 'sensei-late', lines: speech.late }, key)
      : null;
  const session = tellFresh(
    late?.told ?? state.told,
    { name: `sensei-session-${format}`, lines: speech.sessions[format] },
    key,
  );
  const said = ways
    ? tellFresh(
        session.told,
        {
          name: 'sensei-sign-off',
          lines: signOffs(sensei, speech, ways.feedback),
          memory: SIGN_OFF_MEMORY,
        },
        key,
      )
    : null;
  const text = [late?.line, session.line, said?.line].filter((line) => line !== undefined);
  return {
    line: fillSlots(text.join(' '), personSlots('name', sensei)),
    told: said?.told ?? session.told,
  };
}

/** Whether you already came to this short session. */
export function sessionKept(state: GameState, meeting: Meeting): boolean {
  return state.mentor.outcomes[meeting.day] === 'kept';
}
