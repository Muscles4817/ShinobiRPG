import type { PersonDef, RitualKind } from '@/content';
import { addPoints } from '@/systems/bonds';
import type { JournalChip } from '@/systems/journal';
import type { StatDelta } from '@/systems/stats';

import type { GameContext } from '../context';
import { growCharacter } from '../growth';
import { adjust, chip } from '../ops';
import { bondOf } from '../people/cast';
import { personStats } from '../people/progress';
import { sessionGains } from '../people/regimen';
import { teachingFactor } from '../people/teachingFactor';
import { warmed } from '../people/warmth';
import type { GameState } from '../state';
import { SENSEI_MEAL_SATIETY } from './rewards';
import { withAttendance } from './state';

/**
 * What a team day does, by its kind. Every one brings the team together (bond with each
 * teammate; the sensei's bond comes from lessons and talk, so team days don't hurry the
 * nomination) and earns regard for coming; then a meal feeds you, a
 * challenge works the sensei's art, tea is time with them, a debrief sharpens your judgement
 * of what went wrong (more regard), and a camp toughens you.
 */

export const TEAMMATE_DAY_BOND = 4;
export const TEAM_DAY_REGARD = 2;
/** A team day's growth against a full lesson's, for the kinds that train. */
const TEAM_DAY_SHARE = 0.3;
const TEA_BOND = 2;
const DEBRIEF_REGARD = 2;

interface Effect {
  readonly state: GameState;
  readonly chips: readonly JournalChip[];
}

function grown(state: GameState, ctx: GameContext, sensei: PersonDef, gains: StatDelta): Effect {
  const share = Object.fromEntries(
    Object.entries(gains).map(([id, v]) => [id, v * TEAM_DAY_SHARE]),
  );
  const theirs = personStats(sensei, state);
  const teachers = Object.fromEntries(
    Object.keys(gains).map((id) => [id, theirs[id as keyof typeof theirs]]),
  );
  const character = growCharacter(state.character, share, ctx, {
    teacher: teachingFactor(sensei),
    teachers,
  }).character;
  return { state: { ...state, character }, chips: [] };
}

function bonded(state: GameState, ctx: GameContext, id: string, points: number): GameState {
  const bond = addPoints(bondOf(state, id), warmed(state, ctx, points));
  return { ...state, people: { ...state.people, bonds: { ...state.people.bonds, [id]: bond } } };
}

function kindEffect(
  state: GameState,
  ctx: GameContext,
  sensei: PersonDef,
  kind: RitualKind,
): Effect {
  switch (kind) {
    case 'meal':
      return {
        state: adjust(state, { satiety: SENSEI_MEAL_SATIETY }),
        chips: [chip('Fed, on them', 'gain')],
      };
    case 'challenge':
      return grown(state, ctx, sensei, sessionGains(sensei.sensei?.specialty ?? 'taijutsu'));
    case 'tea':
      return { state: bonded(state, ctx, sensei.id, TEA_BOND), chips: [] };
    case 'debrief':
      return {
        state: { ...state, mentor: withAttendance(state.mentor, DEBRIEF_REGARD) },
        chips: [],
      };
    case 'camp':
      return grown(state, ctx, sensei, sessionGains('stamina'));
  }
}

/** The team day's good: bonds all round, regard, and what its kind does. */
export function spendTeamDay(
  state: GameState,
  ctx: GameContext,
  sensei: PersonDef,
  kind: RitualKind,
): Effect {
  const mates = state.people.team?.teammateIds ?? [];
  const together = mates.reduce((s, id) => bonded(s, ctx, id, TEAMMATE_DAY_BOND), state);
  const rated = { ...together, mentor: withAttendance(together.mentor, TEAM_DAY_REGARD) };
  const effect = kindEffect(rated, ctx, sensei, kind);
  return {
    state: effect.state,
    chips: [
      chip('+team bond', 'gain'),
      chip(`${sensei.name}’s regard rises`, 'gain'),
      ...effect.chips,
    ],
  };
}
