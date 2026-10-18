import { fillSlots, pronounForms } from '@/core';
import type { MissionDef } from '@/systems/missions';

import type { GameContext } from '../context';
import { crewLeader } from '../missionTeam';
import { personSlots } from '../people/pronouns';
import type { GameState } from '../state';

/**
 * A job's text speaking of whoever leads the crew: `{leader.name}`, and `{leader.they}`,
 * `{leader.their}`, `{leader.s}` and the other forms, filled from the leader actually along,
 * so a written job never calls a sensei "she" who is a he. Filled when the job is read, since
 * the crew is decided per posting. With nobody leading, the words still agree ("your sensei",
 * they).
 */

const SLOT_MARK = '{leader.';
const NOBODY = 'your sensei';

function leaderSlots(state: GameState, ctx: GameContext): Readonly<Record<string, string>> {
  const leader = crewLeader(state, ctx);
  if (!leader) {
    const forms = Object.entries<string>(pronounForms('they')).map(
      ([form, word]): [string, string] => [`leader.${form}`, word],
    );
    return { 'leader.name': NOBODY, ...Object.fromEntries(forms) };
  }
  return { ...personSlots('leader', leader), 'leader.name': leader.name };
}

function fillDeep<T>(value: T, slots: Readonly<Record<string, string>>): T {
  if (typeof value === 'string') return fillSlots(value, slots) as T;
  if (Array.isArray(value)) {
    const items: readonly unknown[] = value;
    return items.map((v) => fillDeep(v, slots)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]: [string, unknown]) => [
      k,
      fillDeep(v, slots),
    ]);
    return Object.fromEntries(entries) as T;
  }
  return value;
}

/** Jobs whose text speaks of the leader, found once per job. */
const speaksOfLeader = new WeakMap<MissionDef, boolean>();

function needsFill(def: MissionDef): boolean {
  const known = speaksOfLeader.get(def);
  if (known !== undefined) return known;
  const needs = JSON.stringify(def.stages).includes(SLOT_MARK);
  speaksOfLeader.set(def, needs);
  return needs;
}

/** The job as the crew along reads it: its leader slots filled. */
export function withCrewWords(def: MissionDef, state: GameState, ctx: GameContext): MissionDef {
  if (!needsFill(def)) return def;
  return { ...def, stages: fillDeep(def.stages, leaderSlots(state, ctx)) };
}
