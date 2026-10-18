import type { PersonDef, SenseiFeedback, SessionFormat } from '@/content';
import { fillSlots } from '@/core';
import type { StatId } from '@/systems/stats';

import { personSlots } from '../people/pronouns';
import type { GameState } from '../state';
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

const FORMAT_LINES: Readonly<Record<SessionFormat, string>> = {
  drill: '{name} drills you on the basics until they stop being basics.',
  spar: '{name} spars with you, and makes every opening you leave sting.',
  'team-drill': '{name} runs the team through formations until you move as one.',
  field: '{name} takes you out past the walls to read the ground.',
  theory: '{name} draws it in the dirt with a stick and makes you explain it back.',
  meditation: '{name} has you sit still until your chakra settles like a pond.',
  march: '{name} marches you over the hills with a full pack and no complaints allowed.',
  review: '{name} goes through your last fight with you, blow by blow.',
};

const FEEDBACK_LINES: Readonly<Record<SenseiFeedback, string>> = {
  blunt: '“Again. Tomorrow, better.”',
  warm: '“That was good work. Truly.”',
  socratic: '“Why did that work? Think about it tonight.”',
  competitive: '“Not bad. I did it faster at your age.”',
  cryptic: '“The river doesn’t argue with the stone.”',
};

/** One short session's growth against a full lesson's, for a week of `shortSessions`. */
export function sessionShare(shortSessions: number): number {
  return WEEK_OF_SESSIONS / Math.max(1, shortSessions);
}

/** The stat a format drills with this sensei. */
export function formatStat(format: SessionFormat, sensei: PersonDef): StatId {
  if (format === 'drill') return sensei.sensei?.specialty ?? sensei.specialty ?? 'taijutsu';
  return FORMAT_STAT[format];
}

/** The session's story, in their manner; a late sensei is late. */
export function sessionText(sensei: PersonDef, format: SessionFormat): string {
  const ways = waysOf(sensei);
  const late = ways?.cadence.punctuality === 'late' ? `${sensei.name} turns up late. ` : '';
  const said = ways ? ` ${FEEDBACK_LINES[ways.feedback]}` : '';
  return `${late}${fillSlots(FORMAT_LINES[format], personSlots('name', sensei))}${said}`;
}

/** Whether you already came to this short session. */
export function sessionKept(state: GameState, meeting: Meeting): boolean {
  return state.mentor.outcomes[meeting.day] === 'kept';
}
